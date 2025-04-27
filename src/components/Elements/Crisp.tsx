import { useEffect } from 'react';

const CrispChat = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    script.onload = () => {
      console.log("Crisp script loaded successfully!");  // Kiểm tra script có tải thành công không
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = '318f2cb4-43da-4337-a75e-3f2abfc6e101'; // Thay "your_website_id" bằng ID của bạn
    };
    script.onerror = (error) => {
      console.error("Error loading Crisp script: ", error);  // Kiểm tra lỗi nếu có
    };
    document.body.appendChild(script);
  }, []);

  return null;
};

export default CrispChat;
