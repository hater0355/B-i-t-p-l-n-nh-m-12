/* === SCRIPT.JS DÙNG CHUNG === */

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. CODE CHO TRANG ĐĂNG NHẬP ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log("Đang chạy code cho: Trang Login");
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === 'admin' && password === '12345') {
                alert('Đăng nhập thành công!');
                window.location.href = 'index.html'; 
            } else {
                alert('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        });
    }
// --- 2. CODE CHO TRANG NHÂN VIÊN (ĐÃ CẬP NHẬT LƯƠNG CƠ BẢN) ---
    const nhanVienPage = document.getElementById('nhanvien-page');
    if (nhanVienPage) {
        console.log("Đang chạy code cho: Trang Nhân Viên");

        (() => {
            const STORAGE_KEY = 'nhanvien_data_v1';
            const addBtn = nhanVienPage.querySelector('.card-header .btn.btn-primary');
            const tbody = nhanVienPage.querySelector('.data-table tbody');

            if (!addBtn || !tbody) {
                console.error("Không tìm thấy nút hoặc bảng cho trang Nhân Viên!");
                return;
            }

            let employees = loadEmployees();

            function loadEmployees() {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    return raw ? JSON.parse(raw) : [];
                } catch {
                    return [];
                }
            }

            function saveEmployees() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
            }

            // Hàm định dạng tiền tệ
            function formatCurrency(v) {
                if (isNaN(v)) return '0 đ';
                return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }

            function escapeHtml(s = '') {
                return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
            }

            function renderTable() {
                tbody.innerHTML = '';
                employees.forEach((emp, idx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${escapeHtml(emp.id)}</td>
                        <td>${escapeHtml(emp.name)}</td>
                        <td>${escapeHtml(emp.position)}</td>
                        <td>${formatCurrency(emp.salary)}</td> <td>
                            <button class="btn btn-sm btn-edit" title="Sửa"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-delete" title="Xóa"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    
                    tr.querySelector('.btn-edit').addEventListener('click', () => openForm('edit', idx));
                    tr.querySelector('.btn-delete').addEventListener('click', () => {
                         if (confirm(`Xóa nhân viên ${emp.id} — ${emp.name}?`)) {
                            employees.splice(idx, 1);
                            saveEmployees();
                            renderTable();
                         }
                    });

                    tbody.appendChild(tr);
                });
            }

            let modal = null;
            function createModal() {
                modal = document.createElement('div');
                modal.className = 'nv-modal-overlay';
                Object.assign(modal.style, {
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                });

                const box = document.createElement('div');
                box.className = 'nv-modal-box';
                Object.assign(box.style, {
                    width: '420px', background: '#fff', borderRadius: '8px', padding: '18px',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.2)'
                });

                box.innerHTML = `
                    <h3 style="margin:0 0 12px 0">Thêm / Sửa nhân viên</h3>
                    <form id="nv-form">
                        <div style="margin-bottom:8px"><label>Mã NV<br><input name="id" required style="width:100%;padding:6px"></label></div>
                        <div style="margin-bottom:8px"><label>Họ tên<br><input name="name" required style="width:100%;padding:6px"></label></div>
                        <div style="margin-bottom:8px"><label>Chức vụ<br><input name="position" required style="width:100%;padding:6px"></label></div>
                        
                        <div style="margin-bottom:8px">
                            <label>Lương cơ bản<br>
                            <input name="salary" type="number" min="0" value="0" required style="width:100%;padding:6px">
                            </label>
                        </div>
                        
                        <div style="text-align:right; margin-top: 12px;">
                            <button type="button" id="nv-cancel" class="btn">Hủy</button>
                            <button type="submit" class="btn btn-primary" id="nv-submit">Lưu</button>
                        </div>
                    </form>
                `;
                modal.appendChild(box);
                document.body.appendChild(modal);

                modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
                document.getElementById('nv-cancel').addEventListener('click', closeModal);
                document.getElementById('nv-form').addEventListener('submit', handleFormSubmit);
            }

            let currentMode = 'add';
            let editIndex = -1;

            function openForm(mode = 'add', idx = -1) {
                currentMode = mode;
                editIndex = idx;
                if (!modal) createModal();
                const form = document.getElementById('nv-form');
                form.reset();
                form.querySelector('[name=id]').disabled = false;

                if (mode === 'edit' && idx >= 0) {
                    const emp = employees[idx];
                    form.querySelector('[name=id]').value = emp.id;
                    form.querySelector('[name=id]').disabled = true;
                    form.querySelector('[name=name]').value = emp.name;
                    form.querySelector('[name=position]').value = emp.position;
                    form.querySelector('[name=salary]').value = emp.salary || 0; // SỬA Ở ĐÂY
                }
                modal.style.display = 'flex';
                form.querySelector('[name=name]').focus();
            }

            function closeModal() {
                if (modal) modal.style.display = 'none';
                currentMode = 'add';
                editIndex = -1;
            }

            function handleFormSubmit(e) {
                e.preventDefault();
                const form = e.target;
                const id = form.querySelector('[name=id]').value.trim();
                const name = form.querySelector('[name=name]').value.trim();
                const position = form.querySelector('[name=position]').value.trim();
                
                // Lấy và kiểm tra Lương
                const salaryInput = form.querySelector('[name=salary]').value;
                const salary = parseFloat(salaryInput) || 0;

                if (!id || !name || !position) {
                    alert('Vui lòng nhập đầy đủ thông tin Mã NV, Họ tên và Chức vụ.');
                    return;
                }
                
                if (salary < 0) {
                    alert('Lương cơ bản không thể là số âm.');
                    return;
                }

                if (currentMode === 'add') {
                    if (employees.some(emp => emp.id === id)) {
                        alert('Mã NV đã tồn tại.');
                        return;
                    }
                    // Thêm 'salary' vào object
                    employees.push({ 
                        id: escapeHtml(id), 
                        name: escapeHtml(name), 
                        position: escapeHtml(position), 
                        salary: salary 
                    });
                } else if (currentMode === 'edit' && editIndex >= 0) {
                    // Cập nhật 'salary'
                    employees[editIndex].name = escapeHtml(name);
                    employees[editIndex].position = escapeHtml(position);
                    employees[editIndex].salary = salary; 
                }

                saveEmployees();
                renderTable();
                closeModal();
            }

            addBtn.addEventListener('click', () => openForm('add'));
            renderTable();
        })(); // Kết thúc IIFE của trang Nhân viên
    }

    // --- 3. CODE CHO TRANG CHẤM CÔNG (CÓ LỌC NGÀY) ---
    const chamCongPage = document.getElementById('chamcong-page');
    if (chamCongPage) {
        console.log("Đang chạy code cho: Trang Chấm Công (Lọc Ngày)");

        (() => {
            const CC_STORAGE_KEY = 'chamCongList_v1';
            const NV_STORAGE_KEY = 'nhanvien_data_v1'; 
            
            const tableBody = chamCongPage.querySelector(".data-table tbody");
            const addBtn = chamCongPage.querySelector(".btn-primary");
            
            // *** MỚI: Lấy bộ lọc ngày ***
            const dateFilter = chamCongPage.querySelector("#date-filter");

            if (!tableBody || !addBtn || !dateFilter) {
                console.error("Thiếu các thành phần HTML trên trang Chấm Công!");
                return;
            }
            
            let chamCongList = JSON.parse(localStorage.getItem(CC_STORAGE_KEY)) || [];

            function saveData() {
                localStorage.setItem(CC_STORAGE_KEY, JSON.stringify(chamCongList));
            }

            function escapeHtml(s = '') {
                return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
            }

            // --- Hàm renderTable  ---
            function renderTable() {
                // Lấy ngày đang được chọn
                const selectedDate = dateFilter.value;
                tableBody.innerHTML = "";

                // Lọc danh sách chấm công theo ngày
                const filteredList = chamCongList.filter(item => item.ngay === selectedDate);
                
                // Chỉ hiển thị danh sách đã lọc
                filteredList.forEach((item, index) => {
                    // Cần tìm index gốc trong mảng chamCongList để Sửa/Xóa cho đúng
                    const originalIndex = chamCongList.findIndex(originalItem => 
                        originalItem.maNV === item.maNV && 
                        originalItem.ngay === item.ngay && 
                        originalItem.ca === item.ca
                    );

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${escapeHtml(item.maNV)}</td>
                        <td>${escapeHtml(item.hoTen)}</td>
                        <td>${escapeHtml(item.ngay)}</td>
                        <td>${escapeHtml(item.ca)}</td>
                        <td>
                            <button class="btn btn-sm btn-edit" data-index="${originalIndex}" title="Sửa ca"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-delete" data-index="${originalIndex}" title="Xóa"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            }


            // --- Modal Logic ---
            let modal = null;
            function createModal() {
                modal = document.createElement('div');
                modal.className = 'cc-modal-overlay';
                Object.assign(modal.style, {
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                });

                const box = document.createElement('div');
                box.className = 'cc-modal-box';
                Object.assign(box.style, {
                    width: '420px', background: '#fff', borderRadius: '8px', padding: '18px',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.2)'
                });

                // Form HTML
                box.innerHTML = `
                    <h3 style="margin:0 0 12px 0">Thêm / Sửa Chấm Công</h3>
                    <form id="cc-form">
                        <div style="margin-bottom:8px">
                            <label>Chọn nhân viên<br>
                                <select name="employeeSelect" id="cc-employee-select" required style="width:100%;padding:6px">
                                    <option value="">-- Vui lòng chọn --</option>
                                </select>
                            </label>
                        </div>
                        <div style="margin-bottom:8px"><label>Mã NV<br><input name="maNV" readonly style="width:100%;padding:6px;background:#eee"></label></div>
                        <div style="margin-bottom:8px"><label>Họ tên<br><input name="hoTen" readonly style="width:100%;padding:6px;background:#eee"></label></div>
                        
                        <div style="margin-bottom:8px"><label>Ngày<br><input name="ngay" type="date" required style="width:100%;padding:6px"></label></div>
                        
                        <div style="margin-bottom:8px">
                            <label>Chọn ca làm<br>
                                <select name="shiftSelect" required style="width:100%;padding:6px">
                                    <option value="">-- Chọn ca --</option>
                                    <option value="Ca sáng (7:30 - 12:30)">Ca sáng (7:30 - 12:30)</option>
                                    <option value="Ca chiều (12:30 - 17:30)">Ca chiều (12:30 - 17:30)</option>
                                    <option value="Ca tối (17:30 - 22:30)">Ca tối (17:30 - 22:30)</option>
                                </select>
                            </label>
                        </div>
                        <div style="text-align:right; margin-top: 12px;">
                            <button type="button" id="cc-cancel" class="btn">Hủy</button>
                            <button type="submit" class="btn btn-primary" id="cc-submit">Lưu</button>
                        </div>
                    </form>
                `;
                modal.appendChild(box);
                document.body.appendChild(modal);

                // Gắn sự kiện cho modal
                modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
                document.getElementById('cc-cancel').addEventListener('click', closeModal);
                document.getElementById('cc-form').addEventListener('submit', handleFormSubmit);

                document.getElementById('cc-employee-select').addEventListener('change', function() {
                    const selectedOption = this.options[this.selectedIndex];
                    const form = document.getElementById('cc-form');
                    if (selectedOption.value) {
                        form.querySelector('[name="maNV"]').value = selectedOption.value;
                        form.querySelector('[name="hoTen"]').value = selectedOption.dataset.name;
                    } else {
                        form.querySelector('[name="maNV"]').value = '';
                        form.querySelector('[name="hoTen"]').value = '';
                    }
                });
            }

            let currentMode = 'add';
            let editIndex = -1;

            // --- Hàm openForm  ---
            function openForm(mode = 'add', idx = -1) {
                currentMode = mode;
                editIndex = idx;
                if (!modal) createModal();
                
                const form = document.getElementById('cc-form');
                form.reset();
                
                const employeeSelect = document.getElementById('cc-employee-select');
                
                const employees = JSON.parse(localStorage.getItem(NV_STORAGE_KEY)) || [];
                employeeSelect.innerHTML = '<option value="">-- Vui lòng chọn --</option>';
                employees.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.id;
                    option.textContent = `${emp.name} (${emp.id})`;
                    option.dataset.name = emp.name;
                    employeeSelect.appendChild(option);
                });

                if (mode === 'edit' && idx >= 0) {
                    const item = chamCongList[idx];
                    
                    employeeSelect.value = item.maNV;
                    form.querySelector('[name="maNV"]').value = item.maNV;
                    form.querySelector('[name="hoTen"]').value = item.hoTen;
                    form.querySelector('[name="ngay"]').value = item.ngay;
                    form.querySelector('[name="shiftSelect"]').value = item.ca;
                    
                    employeeSelect.disabled = true;
                    form.querySelector('[name="ngay"]').disabled = true; 
                } else {
                    // ***  Tự động điền ngày đang xem vào form ***
                    form.querySelector('[name="ngay"]').value = dateFilter.value;
                    
                    employeeSelect.disabled = false;
                    form.querySelector('[name="ngay"]').disabled = false; // Cho phép sửa ngày khi thêm
                }
                modal.style.display = 'flex';
            }

            function closeModal() {
                if (modal) modal.style.display = 'none';
                currentMode = 'add';
                editIndex = -1;
            }

            function handleFormSubmit(e) {
                e.preventDefault();
                const form = e.target;
                
                const maNV = form.querySelector('[name="maNV"]').value.trim();
                const hoTen = form.querySelector('[name="hoTen"]').value.trim();
                const ngay = form.querySelector('[name="ngay"]').value;
                const ca = form.querySelector('[name="shiftSelect"]').value;

                if (!maNV || !hoTen || !ngay || !ca) {
                    alert('Vui lòng nhập đầy đủ thông tin.');
                    return;
                }
                
                const newItem = {
                    maNV: escapeHtml(maNV),
                    hoTen: escapeHtml(hoTen),
                    ngay: escapeHtml(ngay),
                    ca: escapeHtml(ca)
                };

                if (currentMode === 'add') {
                    if (chamCongList.some(item => item.maNV === maNV && item.ngay === ngay && item.ca === ca)) {
                        alert('Nhân viên này đã được chấm ca này trong ngày hôm nay.');
                        return;
                    }
                    chamCongList.push(newItem);
                } else if (currentMode === 'edit' && editIndex >= 0) {
                    chamCongList[editIndex].ca = newItem.ca;
                }

                saveData();
                renderTable(); // Tự động render lại bảng cho ngày đang chọn
                closeModal();
            }

            function deleteChamCong(index) {
                if (confirm("Bạn có chắc muốn xóa bản ghi chấm công này không?")) {
                    chamCongList.splice(index, 1);
                    saveData();
                    renderTable(); // Tự động render lại
                }
            }
            
            // --- Gắn sự kiện ---
            tableBody.addEventListener('click', function(event) {
                const btn = event.target.closest('button');
                if (!btn) return;
                
                const index = btn.dataset.index;
                if (btn.classList.contains('btn-edit')) {
                    openForm('edit', index);
                } else if (btn.classList.contains('btn-delete')) {
                    deleteChamCong(index);
                }
            });

            addBtn.addEventListener("click", () => openForm('add'));
            
            // *** MỚI: Gắn sự kiện cho bộ lọc ngày ***
            dateFilter.addEventListener('change', renderTable);
            
            // *** MỚI: Đặt ngày mặc định là hôm nay ***
            function setDefaultDate() {
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
                dateFilter.value = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
            }
            
            setDefaultDate(); // Đặt ngày mặc định
            renderTable(); // Render bảng lần đầu

        })(); // Kết thúc IIFE
    }

// --- 4. CODE CHO TRANG TÍNH LƯƠNG (CÓ CHỌN THÁNG) ---
    const tinhLuongPage = document.getElementById('tinhluong-page');
    if (tinhLuongPage) {
        console.log("Đang chạy code cho: Trang Tính Lương (Chọn Tháng)");

        (() => {
            const NV_STORAGE_KEY = 'nhanvien_data_v1';
            const CC_STORAGE_KEY = 'chamCongList_v1';
            
            const tableBody = tinhLuongPage.querySelector(".data-table tbody");
            const calcBtn = tinhLuongPage.querySelector(".btn-success"); 
            
            // ***  Lấy ô chọn tháng ***
            const monthSelector = tinhLuongPage.querySelector("#month-selector");

            if (!tableBody || !calcBtn || !monthSelector) {
                console.error("Thiếu bảng, nút, hoặc ô chọn tháng!");
                return;
            }

            // --- Hàm định dạng tiền tệ ---
            function formatCurrency(v) {
                if (isNaN(v)) return '0 đ';
                return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }
            
            function escapeHtml(s = '') {
                return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
            }

            // --- Hàm chính để tính lương ---
            function calculateAndRenderPayroll() {
                // *** Lấy tháng được chọn (ví dụ: "2025-10") ***
                const selectedMonth = monthSelector.value;
                if (!selectedMonth) {
                    alert("Vui lòng chọn tháng để tính lương!");
                    return;
                }

                const employees = JSON.parse(localStorage.getItem(NV_STORAGE_KEY)) || [];
                const chamCongList = JSON.parse(localStorage.getItem(CC_STORAGE_KEY)) || [];

                // 2. Đếm số ca làm (attendanceMap)
                const attendanceMap = new Map();
                for (const record of chamCongList) {
                    // ***  Chỉ đếm ca làm KHỚP với tháng đã chọn ***
                    // record.ngay có dạng "YYYY-MM-DD"
                    // selectedMonth có dạng "YYYY-MM"
                    if (record.ngay.startsWith(selectedMonth)) {
                        const count = attendanceMap.get(record.maNV) || 0;
                        attendanceMap.set(record.maNV, count + 1);
                    }
                }

                tableBody.innerHTML = ""; 

                // 3. Tính toán và hiển thị
                for (const emp of employees) {
                    const salaryPerShift = emp.salary || 0; 
                    const shiftsWorked = attendanceMap.get(emp.id) || 0; // Số ca đã lọc theo tháng
                    
                    let bonus = 0;
                    if (shiftsWorked >= 50) {
                        bonus = 500000;
                    } else if (shiftsWorked >= 40) {
                        bonus = 350000;
                    } else if (shiftsWorked >= 30) {
                        bonus = 200000;
                    }
                    
                    const totalSalary = (salaryPerShift * shiftsWorked) + bonus;

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${escapeHtml(emp.id)}</td>
                        <td>${escapeHtml(emp.name)}</td>
                        <td>${shiftsWorked}</td>
                        <td>${formatCurrency(salaryPerShift)}</td>
                        <td>${formatCurrency(bonus)}</td>
                        <td>${formatCurrency(totalSalary)}</td>
                    `;
                    tableBody.appendChild(tr);
                }
            }
            
            // --- Cài đặt ban đầu ---
            
            // *** MỚI: Tự động đặt tháng hiện tại làm giá trị mặc định ***
            function setDefaultMonth() {
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0'); // +1 vì getMonth() từ 0-11
                const currentMonth = `${year}-${month}`; // Format: YYYY-MM
                monthSelector.value = currentMonth;
            }
            
            setDefaultMonth(); // Cài tháng mặc định
            
            // Gắn sự kiện cho nút "Tính lương"
            calcBtn.addEventListener('click', calculateAndRenderPayroll);
            
            // Tự động chạy 1 lần khi tải trang
            calculateAndRenderPayroll(); 

        })(); // Kết thúc IIFE
    }

});

    // --- 5. CODE CHO TRANG CHỦ (CÓ CẢ 2 BIỂU ĐỒ + VINH DANH) ---
    const indexPage = document.getElementById('index-page');
    if (indexPage) {
        console.log("Đang chạy code cho: Trang Chủ (Dashboard)");

        (() => {
            const NV_STORAGE_KEY = 'nhanvien_data_v1';
            const CC_STORAGE_KEY = 'chamCongList_v1';
            
            // Lấy các phần tử DOM
            const cardsContainer = indexPage.querySelector(".cards-container");
            const pieChartCtx = indexPage.querySelector("#salaryPieChart")?.getContext('2d');
            
            // Lấy các phần tử DOM MỚI
            const barChartCtx = indexPage.querySelector("#shiftBarChart")?.getContext('2d');
            const eotmNameEl = indexPage.querySelector("#eotm-name");
            const eotmShiftsEl = indexPage.querySelector("#eotm-shifts");
            
            let myPieChart = null; // Biến lưu trữ biểu đồ tròn
            let myBarChart = null; // Biến lưu trữ biểu đồ cột

            if (!cardsContainer || !pieChartCtx || !barChartCtx || !eotmNameEl) {
                console.error("Thiếu các thành phần HTML trên trang chủ!");
                return;
            }

            // --- Hàm định dạng tiền tệ ---
            function formatCurrency(v) {
                if (isNaN(v)) return '0 đ';
                return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            }

            // --- Hàm vẽ biểu đồ tròn (Pie Chart) ---
            function renderPieChart(chartLabels, chartData) {
                if (myPieChart) myPieChart.destroy(); // Hủy biểu đồ cũ
                myPieChart = new Chart(pieChartCtx, {
                    type: 'pie',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Lương tháng',
                            data: chartData,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'
                            ],
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const total = context.chart.getDatasetMeta(0).total;
                                        const percentage = ((value / total) * 100).toFixed(1) + '%';
                                        return `${label}: ${formatCurrency(value)} (${percentage})`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // --- Hàm vẽ biểu đồ cột (Bar Chart)  ---
            function renderBarChart(chartLabels, chartData) {
                if (myBarChart) myBarChart.destroy(); // Hủy biểu đồ cũ
                myBarChart = new Chart(barChartCtx, {
                    type: 'bar', // Loại biểu đồ là cột
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Số ca làm',
                            data: chartData,
                            backgroundColor: 'rgba(75, 192, 192, 0.8)', // Màu xanh
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }, // Ẩn legend vì chỉ có 1 bộ dữ liệu
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        return `${label}: ${value} ca`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Số ca' }
                            }
                        }
                    }
                });
            }

            // --- Hàm chính để tải và hiển thị dữ liệu ---
            function updateDashboard() {
                const employees = JSON.parse(localStorage.getItem(NV_STORAGE_KEY)) || [];
                const chamCongList = JSON.parse(localStorage.getItem(CC_STORAGE_KEY)) || [];
                
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const selectedMonth = `${year}-${month}`;

                // Tính số ca làm của mỗi NV
                const attendanceMap = new Map();
                for (const record of chamCongList) {
                    if (record.ngay.startsWith(selectedMonth)) {
                        const count = attendanceMap.get(record.maNV) || 0;
                        attendanceMap.set(record.maNV, count + 1);
                    }
                }

                let totalPayroll = 0;
                
                // Chuẩn bị dữ liệu cho 2 biểu đồ
                const pieChartLabels = [];
                const pieChartData = [];
                const barChartLabels = [];
                const barChartData = [];
                
                // Chuẩn bị tìm nhân viên của tháng
                let maxShifts = 0;
                let bestEmployeeName = "Chưa có";

                for (const emp of employees) {
                    const salaryPerShift = emp.salary || 0; 
                    const shiftsWorked = attendanceMap.get(emp.id) || 0;
                    
                    let bonus = 0;
                    if (shiftsWorked >= 50) bonus = 500000;
                    else if (shiftsWorked >= 40) bonus = 350000;
                    else if (shiftsWorked >= 30) bonus = 200000;
                    
                    const totalSalary = (salaryPerShift * shiftsWorked) + bonus;
                    totalPayroll += totalSalary;
                    
                    // Thêm dữ liệu Lương (nếu có lương)
                    if (totalSalary > 0) {
                        pieChartLabels.push(emp.name);
                        pieChartData.push(totalSalary);
                    }
                    
                    // Thêm dữ liệu Số Ca (nếu có làm)
                    if (shiftsWorked > 0) {
                        barChartLabels.push(emp.name);
                        barChartData.push(shiftsWorked);
                        
                        // Tìm người làm nhiều ca nhất
                        if (shiftsWorked > maxShifts) {
                            maxShifts = shiftsWorked;
                            bestEmployeeName = emp.name;
                        }
                    }
                }

                // --- 1. Hiển thị Card thông tin ---
                const cardData = [
                    {
                        label: "Tổng số nhân viên",
                        number: employees.length,
                        icon: "fa-users",
                        type: "employees"
                    },
                    {
                        label: `Tổng lương tháng ${month}/${year}`,
                        number: formatCurrency(totalPayroll),
                        icon: "fa-wallet",
                        type: "salary"
                    }
                ];

                cardsContainer.innerHTML = "";
                cardData.forEach(data => {
                    const cardElement = document.createElement("div");
                    cardElement.classList.add("card", data.type); 
                    cardElement.innerHTML = `
                        <div class="card-info">
                            <p class="card-label">${data.label}</p>
                            <p class="card-number">${data.number}</p>
                        </div>
                        <div class="card-icon">
                            <i class="fas ${data.icon}"></i>
                        </div>
                    `;
                    cardsContainer.appendChild(cardElement);
                });
                
                // --- 2. Hiển thị Nhân viên của tháng ---
                eotmNameEl.textContent = bestEmployeeName;
                if (maxShifts > 0) {
                    eotmShiftsEl.textContent = `Với ${maxShifts} ca làm`;
                } else {
                    eotmShiftsEl.textContent = "Chưa có ai làm ca nào";
                }

                // --- 3. Vẽ biểu đồ tròn (Lương) ---
                renderPieChart(pieChartLabels, pieChartData);
                
                // --- 4. Vẽ biểu đồ cột (Số ca) ---
                renderBarChart(barChartLabels, barChartData);
            }
            
            updateDashboard(); // Chạy hàm khi tải trang

        })(); // Kết thúc IIFE
    }
