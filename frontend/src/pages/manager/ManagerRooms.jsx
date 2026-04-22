import React, { useEffect, useState } from "react";
import managerApi from "../../api/modules/manager.api.js";

function ManagerRooms() {
    const [rooms, setRooms] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ theaterId: "", roomNumber: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([managerApi.getRooms(), managerApi.getTheaters()])
            .then(([r, t]) => {
                setRooms(r?.data || []);
                const th = t?.data || [];
                setTheaters(th);
                if (th.length > 0) setForm((f) => ({ ...f, theaterId: th[0]._id }));
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await managerApi.addRoom(form);
            const newRoom = res?.data?.room;
            if (newRoom) {
                const theater = theaters.find((t) => t._id === form.theaterId);
                setRooms((prev) => [...prev, { ...newRoom, theaterId: theater }]);
            }
            setForm((f) => ({ ...f, roomNumber: "" }));
            setShowForm(false);
        } catch (err) {
            alert(err?.data?.message || "Thêm phòng thất bại!");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa phòng "${name}"?`)) return;
        try {
            await managerApi.deleteRoom(id);
            setRooms((prev) => prev.filter((r) => r._id !== id));
        } catch { alert("Xóa thất bại!"); }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Quản lý phòng chiếu</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    + Thêm phòng
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">Thêm phòng chiếu mới</h3>
                    <form onSubmit={handleAdd} className="flex gap-3 flex-wrap items-end">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Rạp phim</label>
                            <select value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 min-w-[200px]">
                                {theaters.map((t) => <option key={t._id} value={t._id}>{t.theaterName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Tên phòng</label>
                            <input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                                placeholder="VD: Phòng 1, IMAX..." required
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 w-44 focus:outline-none focus:border-red-500" />
                        </div>
                        <button type="submit" disabled={saving} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                            {saving ? "Đang lưu..." : "Thêm"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="border border-gray-600 text-gray-400 px-4 py-2 rounded-lg text-sm hover:text-white transition">Hủy</button>
                    </form>
                </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="text-left px-4 py-3 font-medium">Tên phòng</th>
                                <th className="text-left px-4 py-3 font-medium">Rạp phim</th>
                                <th className="text-left px-4 py-3 font-medium">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-800/50">
                                    {[...Array(3)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" /></td>)}
                                </tr>
                            )) : rooms.length === 0 ? (
                                <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-600">Chưa có phòng chiếu nào</td></tr>
                            ) : rooms.map((room) => (
                                <tr key={room._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3 text-white font-medium">{room.roomNumber}</td>
                                    <td className="px-4 py-3 text-gray-400">{room.theaterId?.theaterName || "—"}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(room._id, room.roomNumber)}
                                            className="text-xs px-2.5 py-1 rounded border border-red-400/30 text-red-400 hover:border-red-400 transition">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-800 text-gray-500 text-xs">{rooms.length} phòng chiếu</div>
            </div>
        </div>
    );
}

export default ManagerRooms;
