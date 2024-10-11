"use client";

import { Card, Button, Form, Input, Typography, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
const { Title, Paragraph } = Typography;
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = () => {
    setLoading(true); // Mulai loading
    setTimeout(() => {
      router.push("/dashboard");
      setLoading(false);
    }, 2000);
  };
  return (
    <section className="h-full flex justify-center items-center bg-gray-50">
      <Card bordered={false} className="shadow-lg w-full max-w-sm mx-auto">
        <Title className="text-center pb-0" level={3}>
          Welcome Back!
        </Title>
        <Paragraph className="text-center pb-2">Please enter your username and password to log in.</Paragraph>
        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} className="w-full">
          <Form.Item name="username" rules={[{ required: true, message: "Please input your Username!" }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Please input your Password!" }]}>
            <Input size="large" autoComplete="off" prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button disabled={loading} size="large" block type="primary" htmlType="submit">
              {loading && <Spin className="mr-2" />}
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </section>
  );
}
