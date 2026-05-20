// src/hooks/useKanban.js
// Thay thế KANBAN_CARDS mockData — dữ liệu thật, realtime
// Dùng: const { cards, loading, moveCard, advanceCard, createCard } = useKanban();

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useKanban() {
    const [cards, setCards]     = useState([]);
    const [loading, setLoading] = useState(true);
    const { profile }           = useAuth();

    useEffect(() => {
        fetchCards();

        // Realtime: Kanban tự cập nhật khi Trưởng ca kéo thẻ
        const channel = supabase
            .channel('kanban_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'don_hang_son',
                  filter: "trang_thai_don_hang=in.(Duyet san xuat,Dang san xuat,Da hoan thanh)" },
                () => fetchCards()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    async function fetchCards() {
        setLoading(true);
        const { data, error } = await supabase
            .from('don_hang_son')
            .select(`
                *,
                san_pham:id_san_pham ( ma_san_pham, ten_san_pham, don_vi_tinh ),
                nguoi_tao:nguoi_tao_don ( ho_ten ),
                nguoi_uu_tien:nguoi_dat_uu_tien ( ho_ten )
            `)
            .in('trang_thai_don_hang', [
                'Duyet san xuat',
                'Dang san xuat',
                'Da hoan thanh',
                'Nhap kho phe pham',
            ])
            .order('thu_tu_uu_tien', { ascending: true });

        if (!error) setCards(data ?? []);
        setLoading(false);
    }

    // Map trạng thái DB → cột Kanban
    function trangThaiToCol(trangThai) {
        const map = {
            'Duyet san xuat': 'waiting',
            'Dang san xuat':  'running',
            'Da hoan thanh':  'done',
        };
        return map[trangThai] || 'waiting';
    }

    // Map cột Kanban → trạng thái DB
    function colToTrangThai(col) {
        const map = {
            'waiting': 'Duyet san xuat',
            'running': 'Dang san xuat',
            'done':    'Da hoan thanh',
        };
        return map[col];
    }

    // Kéo thả thẻ sang cột khác
    async function moveCard(id, toCol) {
        const trangThaiMoi = colToTrangThai(toCol);
        if (!trangThaiMoi) return;

        const updates = { trang_thai_don_hang: trangThaiMoi };

        // Tự động ghi timestamp khi bắt đầu / hoàn thành
        if (toCol === 'running') updates.ngay_bat_dau_sx = new Date().toISOString();
        if (toCol === 'done')    updates.ngay_hoan_thanh_sx = new Date().toISOString();

        const { error } = await supabase
            .from('don_hang_son')
            .update(updates)
            .eq('id', id);

        if (error) throw new Error(error.message);

        await supabase.from('nhat_ky_chinh_sua').insert({
            id_don_hang: id,
            nguoi_sua: profile.id,
            hanh_dong: `Kanban: chuyen sang ${trangThaiMoi}`,
            du_lieu_moi: updates,
            ly_do_sua: 'Kéo thả trên bảng Kanban',
        });
    }

    // Chuyển bước tiếp theo nhanh (nút "Tiếp" trên thẻ)
    async function advanceCard(id) {
        const card = cards.find(c => c.id === id);
        if (!card) return;

        const nextMap = {
            'Duyet san xuat': 'Dang san xuat',
            'Dang san xuat':  'Da hoan thanh',
        };
        const next = nextMap[card.trang_thai_don_hang];
        if (!next) return;

        await moveCard(id, Object.keys({ waiting:'Duyet san xuat', running:'Dang san xuat', done:'Da hoan thanh' }).find(k => ({ waiting:'Duyet san xuat', running:'Dang san xuat', done:'Da hoan thanh' })[k] === next));
    }

    return { cards, loading, moveCard, advanceCard, refresh: fetchCards };
}
