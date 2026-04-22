import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserAddOutlined } from "@ant-design/icons";
import publicClient from "../../api/clients/public.client";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/loading.slice.js";

const { Title, Text } = Typography;

function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    dispatch(showLoading());
    try {
      const res = await publicClient.post("user/signup", {
        userName: values.userName,
        email: values.email,
        password: values.password,
      });

      const data = res?.data;
      message.success(data?.message || "Đăng ký thành công!");

      if (data?.requireVerify) {
        navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        navigate("/auth/signin");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Đăng ký thất bại";
      message.error(msg);
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <span className="text-red-500 text-5xl mb-2">🎬</span>
          <h1 className="text-white text-2xl font-bold">
            Cine<span className="text-red-500">Book</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Tạo tài khoản mới</p>
        </div>

        <Form
          name="signup"
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
        >
          <Form.Item
            label={<span className="text-gray-300 text-sm">Tên người dùng</span>}
            name="userName"
            rules={[{ required: true, message: "Hãy nhập tên người dùng!" }]}
          >
            <Input
              size="large"
              placeholder="Tên của bạn"
              className="rounded-lg bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: "Hãy nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu"
              className="rounded-lg bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300 text-sm">Xác nhận mật khẩu</span>}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Hãy xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Nhập lại mật khẩu"
              className="rounded-lg bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="rounded-lg font-semibold bg-red-500 hover:bg-red-600 border-0"
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6 text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link to="/auth/signin" className="text-red-400 hover:text-red-300 font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
