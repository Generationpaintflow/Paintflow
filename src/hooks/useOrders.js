// src/hooks/useOrders.js
// Thay thế hoàn toàn mockData ORDERS
// Dữ liệu thật từ Supabase, realtime — thay đổi của người này hiện ngay cho người kia
// Dùng: const { orders, loading, createOrder, updateOrder, updatePriority } = useOrders();

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useOrders(filter = {}) {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const { profile }           = useAuth();

    useEffect(() => {
        fetchOrders();

        // Realtime: tự cập nhật khi có người thay đổi đơn hàng
        const channel = supabase
            .channel('don_hang_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'don_hang_son' },
                () => fetchOrders() // Tải lại khi có thay đổi
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [filter.status, filter.priority]);

    async function fetchOrders() {
        setLoading(true);
        let query = supabase
            .from('don_hang_son')
            .select(`
                *,
                san_pham:id_san_pham ( ma_san_pham, ten_san_pham, don_vi_tinh ),
                nguoi_tao:nguoi_tao_don ( ho_ten ),
                nguoi_duyet:nguoi_duyet_ky_thuat ( ho_ten )
            `)
            .order('thu_tu_uu_tien', { ascending: true })
            .order('ngay_khach_yeu_cau', { ascending: true });

        // Lọc theo trạng thái nếu có
        if (filter.status) query = query.eq('trang_thai_don_hang', filter.status);

        // NV KD chỉ thấy đơn của mình
        if (profile?.chuc_vu === 'Nhan Vien KD') {
            query = query.eq('nguoi_tao_don', profile.id);
        }

        const { data, error } = await query;
        if (error) setError(error.message);
        else setOrders(data ?? []);
        setLoading(false);
    }

    // Tạo đơn hàng mới
    async function createOrder(donHang) {
        // Kiểm tra tổng số lượng trước khi gửi
        const { sl_tong_don_hang, sl_giao_ngay_kho = 0, sl_san_xuat_moi = 0, sl_pha_mau = 0 } = donHang;
        if (sl_giao_ngay_kho + sl_san_xuat_moi + sl_pha_mau !== sl_tong_don_hang) {
            throw new Error(`Tổng phân loại (${sl_giao_ngay_kho + sl_san_xuat_moi + sl_pha_mau}) không khớp với tổng đơn hàng (${sl_tong_don_hang})`);
        }

        const { data, error } = await supabase
            .from('don_hang_son')
            .insert({ ...donHang, nguoi_tao_don: profile.id })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // Cập nhật đơn (có Freeze Point — chặn từ bước 3)
    async function updateOrder(id, updates, lyDoSua) {
        // Lấy trạng thái hiện tại
        const { data: current } = await supabase
            .from('don_hang_son')
            .select('trang_thai_don_hang')
            .eq('id', id)
            .single();

        const TRANG_THAI_KHOA = ['Duyet san xuat', 'Dang san xuat', 'Da hoan thanh', 'Da giao hang', 'Nhap kho phe pham'];
        if (TRANG_THAI_KHOA.includes(current?.trang_thai_don_hang)) {
            throw new Error(`Đơn hàng đang ở "${current.trang_thai_don_hang}". Không thể chỉnh sửa!`);
        }

        const { error } = await supabase
            .from('don_hang_son')
            .update(updates)
            .eq('id', id);

        if (error) throw new Error(error.message);

        // Ghi audit log
        await supabase.from('nhat_ky_chinh_sua').insert({
            id_don_hang: id,
            nguoi_sua: profile.id,
            hanh_dong: 'Chinh sua don hang',
            du_lieu_moi: updates,
            ly_do_sua: lyDoSua || 'Cập nhật thông tin đơn hàng',
        });
    }

    // Cập nhật thứ tự ưu tiên — chỉ Quản đốc
    async function updatePriority(id, thuTuMoi) {
        if (profile?.chuc_vu !== 'Quan Doc') {
            throw new Error('Chỉ Quản đốc mới được điều chỉnh thứ tự ưu tiên');
        }

        const { error } = await supabase
            .from('don_hang_son')
            .update({
                thu_tu_uu_tien: thuTuMoi,
                nguoi_dat_uu_tien: profile.id,
                thoi_gian_dat_uu_tien: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(error.message);

        await supabase.from('nhat_ky_chinh_sua').insert({
            id_don_hang: id,
            nguoi_sua: profile.id,
            hanh_dong: 'Cap nhat uu tien',
            truong_sua: 'thu_tu_uu_tien',
            du_lieu_moi: { thu_tu_uu_tien: thuTuMoi },
            ly_do_sua: 'Quản đốc điều chỉnh thứ tự sản xuất',
        });
    }

    // Chuyển bước trạng thái
    async function chuyenTrangThai(id, trangThaiMoi, lyDo) {
        const { error } = await supabase
            .from('don_hang_son')
            .update({ trang_thai_don_hang: trangThaiMoi })
            .eq('id', id);

        if (error) throw new Error(error.message);

        await supabase.from('nhat_ky_chinh_sua').insert({
            id_don_hang: id,
            nguoi_sua: profile.id,
            hanh_dong: `Chuyen trang thai: ${trangThaiMoi}`,
            du_lieu_moi: { trang_thai_don_hang: trangThaiMoi },
            ly_do_sua: lyDo || `Chuyển sang ${trangThaiMoi}`,
        });
    }

    return { orders, loading, error, createOrder, updateOrder, updatePriority, chuyenTrangThai, refresh: fetchOrders };
}
