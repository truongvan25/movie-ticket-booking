import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/features/auth.slice.js";

const SigninPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, status, error, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && status === "succeeded") {
            if (user?.role === "admin") {
                navigate("/admin/dashboard", { replace: true });
            } else if (user?.role === "theater-manager") {
                navigate("/manager/dashboard", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, status, navigate, user]);

    useEffect(() => {
        if (status === "failed" && error) {
            message.error(error);
        }
    }, [status, error]);

    if (isAuthenticated && status !== "loading") return null;

    const onFinish = (values) => {
        dispatch(loginUser({ email: values.email, password: values.password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <span className="text-red-500 text-5xl mb-2">🎬</span>
                    <h1 className="text-white text-2xl font-bold">
                        Cine<span className="text-red-500">Book</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục</p>
                </div>

                <Form name="signin" layout="vertical" autoComplete="off" onFinish={onFinish}>
                    <Form.Item
                        label={<span className="text-gray-300 text-sm">Email</span>}
                        name="email"
                        rules={[
                            { required: true, message: "Hãy nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Email của bạn"
                            className="rounded-lg bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-gray-300 text-sm">Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Mật khẩu của bạn"
                            className="rounded-lg bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        />
                    </Form.Item>

                    {status === "failed" && error && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <Form.Item className="mb-0 mt-2">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={status === "loading"}
                            className="rounded-lg font-semibold bg-red-500 hover:bg-red-600 border-0"
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-4">
                    <Link
                        to="/auth/forgot-password"
                        className="text-gray-500 hover:text-gray-300 text-sm"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <div className="text-center mt-6 text-sm text-gray-500">
                    Chưa có tài khoản?{" "}
                    <Link to="/auth/signup" className="text-red-400 hover:text-red-300 font-medium">
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SigninPage;
