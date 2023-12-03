document.addEventListener("DOMContentLoaded", function() {
    fetchData();
});

const itemsPerPage = 10;
let currentPage = 1;
let filteredData = [];

function fetchData() {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
        .then(response => response.json())
        .then(data => {

            const uniqueData = data.filter((user, index, self) =>
                index === self.findIndex(u => u.id === user.id)
            );

            filteredData = uniqueData;
            updateTable();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function populateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;


    for (let i = startIndex; i < endIndex && i < data.length; i++) {
        const user = data[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" onclick="selectRow(this)"></td>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="edit"  onclick="editRow(${user.id})"><i class="far fa-edit"></i></button>
                <button  class="delete" onclick="deleteRow(${user.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

function updateTable() {
    console.log('Current Page:', currentPage);
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = searchTerm ?
        filteredData.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        ) :
        filteredData;

    populateTable(filtered);
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentPageSpan = document.getElementById('currentPage');
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;

    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const createPageButton = (page, text) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = () => {
            currentPage = page;
            updateTable();
            updatePagination();
        };
        return button;
    };


    if (currentPage > 1 || (currentPage == 1 && document.getElementById('searchInput').value.trim() !== '')) {
        pagination.appendChild(createPageButton(1, 'First'));
        pagination.appendChild(createPageButton(Math.max(currentPage - 1, 1), 'Previous'));
    }


    const maxPagesToShow = 4;
    let startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow + 1));
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageButton(i, `${i}`));
    }

    if (currentPage < totalPages) {
        pagination.appendChild(createPageButton(currentPage + 1, 'Next'));
        pagination.appendChild(createPageButton(totalPages, 'Last'));
    }
}

function search() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    updateTable();

}