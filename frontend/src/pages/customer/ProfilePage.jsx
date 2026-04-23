import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import customerApi from "../../api/modules/customer.api.js";
import { logout } from "../../redux/features/auth.slice.js";
import { PATH } from "../../routes/path.js";

const ROLE_LABEL = { customer: "Khách hàng", admin: "Admin", "theater-manager": "Quản lý rạp" };
const ROLE_STYLE = {
    customer: "bg-blue-500/20 text-blue-400",
    admin: "bg-red-500/20 text-red-400",
    "theater-manager": "bg-purple-500/20 text-purple-400",
};

export default function ProfilePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user: authUser } = useSelector((s) => s.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit name
    const [editName, setEditName] = useState(false);
    const [nameVal, setNameVal] = useState("");
    const [nameSaving, setNameSaving] = useState(false);
    const [nameMsg, setNameMsg] = useState("");

    // Change password
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        if (!isAuthenticated) { navigate(`/auth/${PATH.SIGNIN}`); return; }
        customerApi.getProfile()
            .then((r) => {
                const p = r?.data || r;
                setProfile(p);
                setNameVal(p.userName);
            })
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleSaveName = async (e) => {
        e.preventDefault();
        setNameMsg("");
        setNameSaving(true);
        try {
            await customerApi.updateProfile({ userName: nameVal });
            setProfile((prev) => ({ ...prev, userName: nameVal }));
            setEditName(false);
            setNameMsg("Đã cập nhật tên thành công!");
        } catch (err) {
            setNameMsg(err?.message || "Cập nhật thất bại!");
        } finally {
            setNameSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg({ type: "", text: "" });
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
            return;
        }
        setPwSaving(true);
        try {
            await customerApi.changePassword({
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            setPwMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
            setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (err) {
            setPwMsg({ type: "error", text: err?.message || "Đổi mật khẩu thất bại!" });
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-gray-500 animate-pulse">Đang tải...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Tài khoản của tôi</h1>
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm transition">
                        ← Quay lại
                    </button>
                </div>

                {/* Info card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-2xl font-bold text-red-400">
                            {profile?.userName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">{profile?.userName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[profile?.role] || ""}`}>
                                {ROLE_LABEL[profile?.role] || profile?.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-800 pt-4">
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Email</p>
                            <p className="text-white">{profile?.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Ngày tham gia</p>
                            <p className="text-white">{new Date(profile?.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs mb-1">Trạng thái</p>
                            <p className={profile?.isVerified ? "text-green-400" : "text-yellow-400"}>
                                {profile?.isVerified ? "✓ Đã xác thực" : "Chưa xác thực"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit name */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold">Cập nhật tên hiển thị</h2>
                        {!editName && (
                            <button onClick={() => setEditName(true)}
                                className="text-red-400 hover:text-red-300 text-sm transition">
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                    {editName ? (
                        <form onSubmit={handleSaveName} className="space-y-3">
                            <input
                                value={nameVal}
                                onChange={(e) => setNameVal(e.target.value)}
                                placeholder="Tên hiển thị"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
                            />
                            <div className="flex gap-3">
                                <button type="submit" disabled={nameSaving}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                                    {nameSaving ? "Đang lưu..." : "Lưu"}
                                </button>
                                <button type="button" onClick={() => { setEditName(false); setNameVal(profile?.userName); }}
                                    className="border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition">
                                    Hủy
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-gray-400 text-sm">{profile?.userName}</p>
                    )}
                    {nameMsg && <p className="text-green-400 text-xs mt-2">{nameMsg}</p>}
                </div>

                {/* Change password */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-4">Đổi mật khẩu</h2>
                    <form onSubmit={handleChangePassword} className="space-y-3">
                        {[
                            { key: "currentPassword", label: "Mật khẩu hiện tại" },
                            { key: "newPassword", label: "Mật khẩu mới" },
                            { key: "confirm", label: "Xác nhận mật khẩu mới" },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-gray-400 text-xs mb-1">{label}</label>
                                <input
                                    type="password"
                                    value={pwForm[key]}
                                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
                                />
                            </div>
                        ))}
                        {pwMsg.text && (
                            <p className={`text-xs ${pwMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                                {pwMsg.text}
                            </p>
                        )}
                        <button type="submit" disabled={pwSaving}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
                            {pwSaving ? "Đang xử lý..." : "Đổi mật khẩu"}
                        </button>
                    </form>
                </div>

                {/* Quick links */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-2">
                    <button onClick={() => navigate(`/${PATH.MY_TICKETS}`)}
                        className="flex-1 text-center text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-xl transition">
                        🎫 Vé của tôi
                    </button>
                    <button onClick={() => navigate(`/${PATH.BOOKING_HISTORY}`)}
                        className="flex-1 text-center text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-xl transition">
                        📋 Lịch sử đặt vé
                    </button>
                    <button onClick={() => navigate(`/${PATH.SUPPORT}`)}
                        className="flex-1 text-center text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-xl transition">
                        💬 Hỗ trợ
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={() => dispatch(logout())}
                    className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 rounded-2xl text-sm font-medium transition"
                >
                    🚪 Đăng xuất
                </button>
            </div>
        </div>
    );
}
