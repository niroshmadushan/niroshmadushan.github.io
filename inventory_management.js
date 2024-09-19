document.addEventListener('DOMContentLoaded', () => {
    // Define elements
    const inventoryTableBody = document.querySelector('#inventoryTable tbody');
    const totalStockValue = document.getElementById('totalStockValue');
    const addProductModal = document.getElementById('addProductModal');
    const grnModal = document.getElementById('grnModal');
    const gonModal = document.getElementById('gonModal');
    const productSelect = document.getElementById('grnProductSelect');
    const gonProductSelect = document.getElementById('gonProductSelect');
    const searchTermInput = document.getElementById('searchTerm');
    const modals = document.querySelectorAll('.modal');

    let inventory = []; // Main inventory list
    let productList = []; // Product List for GRN/GON
    let grnEntries = []; // GRN Entries
    let gonEntries = []; // GON Entries

    // Fetch current stock data from the backend
    async function fetchCurrentStock() {
        try {
            const response = await fetch('get_current_stock.php');
            const data = await response.json();
            if (data.success) {
                inventory = data.stock;
                displayInventory(inventory);
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            console.error('Error fetching current stock:', error);
            Swal.fire('Error', 'Failed to fetch current stock.', 'error');
        }
    }

    // Display inventory in the table
    function displayInventory(items) {
        inventoryTableBody.innerHTML = ''; // Clear existing rows
        let totalValue = 0;
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id || 'N/A'}</td>
                <td>${item.product || 'N/A'}</td>
                <td>${item.quantity || 0}</td>
                <td>${item.value || 0}</td>
                <td>${item.lastUpdated || 'N/A'}</td>
            `;
            totalValue += parseFloat(item.value) || 0;
            inventoryTableBody.appendChild(row);
        });
        totalStockValue.innerText = totalValue.toFixed(2);
    }

    // Filter inventory based on the search term
    function filterInventory() {
        const searchTerm = searchTermInput.value.toLowerCase();
        const filteredInventory = inventory.filter(item =>
            item.product && item.product.toLowerCase().includes(searchTerm)
        );
        displayInventory(filteredInventory);
    }

    // Open/Close modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = () => {
            modals.forEach(modal => modal.style.display = 'none');
        };
    });

    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            modals.forEach(modal => modal.style.display = 'none');
        }
    };

    // Add Product Modal
    document.getElementById('openAddProductModal').onclick = () => {
        addProductModal.style.display = 'block';
    };

    document.getElementById('addProductBtn').onclick = async () => {
        const productName = document.getElementById('productName').value;
        if (productName) {
            try {
                const response = await fetch('add_product.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: productName })
                });
                const result = await response.json();
                if (result.success) {
                    Swal.fire('Success', 'Product added successfully!', 'success');
                    fetchCurrentStock(); // Refresh stock
                    addProductModal.style.display = 'none';
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to add product.', 'error');
            }
        } else {
            Swal.fire('Warning', 'Please enter a product name.', 'warning');
        }
    };

    // GRN Modal
    document.getElementById('openGRNModal').onclick = async () => {
        grnModal.style.display = 'block';
        try {
            const response = await fetch('get_products.php');
            const data = await response.json();
            if (data.success) {
                productList = data.products;
                populateProductSelect(productSelect, productList);
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to load products.', 'error');
        }
    };

    // GON Modal
    document.getElementById('openGONModal').onclick = async () => {
        gonModal.style.display = 'block';
        try {
            const response = await fetch('get_products.php');
            const data = await response.json();
            if (data.success) {
                productList = data.products;
                populateProductSelect(gonProductSelect, productList);
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to load products.', 'error');
        }
    };

    // Populate product dropdown
    function populateProductSelect(selectElement, products) {
        selectElement.innerHTML = '<option value="">Select Product</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            selectElement.appendChild(option);
        });
    }

    // Add GRN
    document.getElementById('addGRNBtn').onclick = async () => {
        const product = productSelect.value;
        const quantity = document.getElementById('grnQuantity').value;
        const unitPrice = document.getElementById('grnUnitPrice').value;
        if (product && quantity && unitPrice) {
            try {
                const response = await fetch('add_grn.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product, quantity: parseFloat(quantity), unitPrice: parseFloat(unitPrice) })
                });
                const result = await response.json();
                if (result.success) {
                    Swal.fire('Success', 'GRN entry added successfully!', 'success');
                    fetchCurrentStock(); // Refresh stock
                    grnModal.style.display = 'none';
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to add GRN entry.', 'error');
            }
        } else {
            Swal.fire('Warning', 'Please fill in all fields.', 'warning');
        }
    };

    // Add GON
    document.getElementById('addGONBtn').onclick = async () => {
        const product = gonProductSelect.value;
        const quantity = document.getElementById('gonQuantity').value;
        if (product && quantity) {
            try {
                const response = await fetch('add_gon.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product, quantity: parseFloat(quantity) })
                });
                const result = await response.json();
                if (result.success) {
                    Swal.fire('Success', 'GON entry added successfully!', 'success');
                    fetchCurrentStock(); // Refresh stock
                    gonModal.style.display = 'none';
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to add GON entry.', 'error');
            }
        } else {
            Swal.fire('Warning', 'Please fill in all fields.', 'warning');
        }
    };

    // Generate Report and Print
    document.getElementById('printReportBtn').onclick = async () => {
        try {
            const response = await fetch('get_report_data.php', {
                method: 'GET'
            });
            const data = await response.json();
            if (data.success) {
                const grnEntries = data.grnEntries;
                const gonEntries = data.gonEntries;
                const currentStock = data.currentStock;
    
                // Generate the report with the data received
                generateReport(grnEntries, gonEntries, currentStock);
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to generate report.', 'error');
        }
    };
    
    // Function to generate the report and print
   // Function to generate the report and print
function generateReport(grnEntries, gonEntries, currentStock) {
    // Open a new window for the report
    let reportWindow = window.open('', '', 'width=800,height=600');

    // Add basic styles to the report
    const styles = `
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h2 {
                color: #333;
                border-bottom: 2px solid #1976d2;
                padding-bottom: 5px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                padding: 10px;
                text-align: center;
            }
            th {
                background-color: #1976d2;
                color: white;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            tr:hover {
                background-color: #ddd;
            }
            .no-data {
                text-align: center;
                color: #777;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #555;
            }
        </style>
    `;

    // Add the report content
    let reportContent = `
        <html>
        <head>
            <title>Inventory Management Report</title>
            ${styles}
        </head>
        <body>
            <h1>Inventory Management Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
    `;

    // Add GRN Table
    reportContent += '<h2>Goods Received Notes (GRNs)</h2>';
    if (grnEntries.length > 0) {
        reportContent += `
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price (Rs.)</th>
                        <th>Total (Rs.)</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        grnEntries.forEach(entry => {
            reportContent += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.product}</td>
                    <td>${entry.quantity}</td>
                    <td>${entry.unitPrice}</td>
                    <td>${entry.total}</td>
                    <td>${entry.date}</td>
                </tr>
            `;
        });
        reportContent += '</tbody></table>';
    } else {
        reportContent += '<p class="no-data">No GRN entries found.</p>';
    }

    // Add GON Table
    reportContent += '<h2>Goods Out Notes (GONs)</h2>';
    if (gonEntries.length > 0) {
        reportContent += `
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price (Rs.)</th>
                        <th>Total (Rs.)</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        gonEntries.forEach(entry => {
            reportContent += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.product}</td>
                    <td>${entry.quantity}</td>
                    <td>${entry.unitPrice}</td>
                    <td>${entry.total}</td>
                    <td>${entry.date}</td>
                </tr>
            `;
        });
        reportContent += '</tbody></table>';
    } else {
        reportContent += '<p class="no-data">No GON entries found.</p>';
    }

    // Add Current Stock Table
    reportContent += '<h2>Current Stock</h2>';
    if (currentStock.length > 0) {
        reportContent += `
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total Value (Rs.)</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        currentStock.forEach(entry => {
            reportContent += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.product}</td>
                    <td>${entry.quantity}</td>
                    <td>${entry.value}</td>
                    <td>${entry.date}</td>
                </tr>
            `;
        });
        reportContent += '</tbody></table>';
    } else {
        reportContent += '<p class="no-data">No Current Stock entries found.</p>';
    }

    // Add footer and close tags
    reportContent += `
            <div class="footer">
                <p>This is a system-generated report. © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;

    // Write content to the report window and print
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.print();
}


    // Attach event listener to the search input
    searchTermInput.addEventListener('input', filterInventory);

    // Initial data fetch
    fetchCurrentStock();
});
