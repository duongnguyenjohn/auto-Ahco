import React, { useState, useEffect } from 'react';

export default function App() {
  const [db, setDb] = useState({ items: [], auto_calculation_engine: [] });
  const [cart, setCart] = useState([]);

  // 1. Tải dữ liệu từ public/master_data.json khi mở web
  useEffect(() => {
    fetch('/master_data.json')
      .then(res => res.json())
      .then(data => {
        setDb(data);
        // Khởi tạo giỏ hàng mặc định từ danh sách items
        const initialCart = data.items.map(item => ({
          ...item,
          quantity: 0,
          isAutoAdded: false
        }));
        setCart(initialCart);
      })
      .catch(err => console.error("Lỗi tải Database:", err));
  }, []);

  // 2. Logic xử lý khi nhập số lượng + Engine tự động
  const handleQuantityChange = (itemId, newQuantity) => {
    let updatedCart = [...cart];
    const qty = Number(newQuantity);

    // Cập nhật số lượng item hiện tại
    const currentIdx = updatedCart.findIndex(i => i.item_id === itemId);
    if (currentIdx > -1) updatedCart[currentIdx].quantity = qty;

    // Chạy Engine tự động tính toán
    db.auto_calculation_engine.forEach(rule => {
      if (rule.trigger_item === itemId) {
        // Biến chuỗi công thức thành hàm chạy được
        const calculateTargetQty = new Function('quantity_input', `return ${rule.formula}`);
        const targetQuantity = calculateTargetQty(qty);

        // Áp dụng số lượng mới cho item đích (VD: Đầu nối)
        const targetIdx = updatedCart.findIndex(i => i.item_id === rule.target_item);
        if (targetIdx > -1) {
          updatedCart[targetIdx].quantity = targetQuantity;
          updatedCart[targetIdx].isAutoAdded = true;
        }
      }
    });

    setCart(updatedCart);
  };

  // 3. Tính tổng bill
  const totalBill = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Hệ Thống Báo Giá Tự Động (CPQ)
        </h1>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 border border-blue-700 rounded-tl-lg">Hạng mục</th>
              <th className="p-3 border border-blue-700 text-center">Đơn giá (USD)</th>
              <th className="p-3 border border-blue-700 text-center">Số lượng</th>
              <th className="p-3 border border-blue-700 text-right rounded-tr-lg">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr 
                key={item.item_id} 
                className={`border-b transition-colors ${item.isAutoAdded && item.quantity > 0 ? "bg-orange-50" : "hover:bg-gray-50"}`}
              >
                <td className="p-3 border-x">
                  {item.name}
                  {item.isAutoAdded && item.quantity > 0 && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
                      Tự động thêm
                    </span>
                  )}
                </td>
                <td className="p-3 border-x text-center text-gray-600">
                  ${item.unit_price.toFixed(2)}
                </td>
                <td className="p-3 border-x text-center">
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    readOnly={item.isAutoAdded}
                    onChange={(e) => handleQuantityChange(item.item_id, e.target.value)}
                    className={`w-20 p-1 border rounded text-center focus:ring-2 focus:ring-blue-500 outline-none ${item.isAutoAdded ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
                  />
                </td>
                <td className="p-3 border-x text-right font-semibold text-gray-800">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="bg-gray-100 p-4 rounded-lg w-64 border border-gray-200">
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">${totalBill.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}