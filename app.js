const API = 'https://api.escuelajs.co/api/v1/products';

let products = [];
let filtered = [];
let page = 1;
let pageSize = 10;
let sortKey = '';
let sortAsc = true;

const tableBody = document.getElementById('tableBody');
const tooltip = document.getElementById('tooltip');

/* ================= FETCH DATA ================= */
fetch(API)
  .then(res => res.json())
  .then(data => {
    products = data;
    filtered = [...products];
    render();
  });

/* ================= RENDER ================= */
function render() {
  const start = (page - 1) * pageSize;
  const view = filtered.slice(start, start + pageSize);

  tableBody.innerHTML = '';

  view.forEach(p => {
    const imgUrl = Array.isArray(p.images) ? p.images[0] : p.images;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || ''}</td>
      <td>
        <img src="${imgUrl}"
             width="60" height="60"
             onerror="this.src='https://via.placeholder.com/60'">
      </td>
    `;

    // Tooltip description
    tr.onmouseenter = e => {
      tooltip.innerText = p.description;
      tooltip.style.display = 'block';
      tooltip.style.top = e.pageY + 10 + 'px';
      tooltip.style.left = e.pageX + 10 + 'px';
    };

    tr.onmouseleave = () => tooltip.style.display = 'none';

    // Open detail modal
    tr.onclick = () => openDetail(p);

    tableBody.appendChild(tr);
  });

  renderPagination();
}

/* ================= PAGINATION ================= */
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `btn btn-outline-primary me-1 ${i === page ? 'active' : ''}`;
    btn.innerText = i;
    btn.onclick = () => {
      page = i;
      render();
    };
    pag.appendChild(btn);
  }
}

/* ================= SEARCH ================= */
document.getElementById('searchInput').addEventListener('input', e => {
  const keyword = e.target.value.toLowerCase();

  filtered = products.filter(p =>
    p.title.toLowerCase().includes(keyword)
  );

  page = 1;
  render();
});

/* ================= PAGE SIZE ================= */
document.getElementById('pageSize').onchange = e => {
  pageSize = +e.target.value;
  page = 1;
  render();
};

/* ================= SORT ================= */
function sortBy(key) {
  sortAsc = sortKey === key ? !sortAsc : true;
  sortKey = key;

  filtered.sort((a, b) => {
    if (a[key] < b[key]) return sortAsc ? -1 : 1;
    if (a[key] > b[key]) return sortAsc ? 1 : -1;
    return 0;
  });

  render();
}

/* ================= EXPORT CSV (VIEW HIỆN TẠI) ================= */
function exportCSV() {
  let csv = 'id,title,price\n';

  const start = (page - 1) * pageSize;
  const view = filtered.slice(start, start + pageSize);

  view.forEach(p => {
    csv += `${p.id},"${p.title}",${p.price}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products.csv';
  a.click();
}

/* ================= DETAIL MODAL ================= */
function openDetail(p) {
  detailId.value = p.id;
  detailTitle.value = p.title;
  detailPrice.value = p.price;
  detailDesc.value = p.description;
  detailImage.value = p.images[0] || '';
  detailPreview.src = p.images[0] || 'https://via.placeholder.com/150';

  new bootstrap.Modal(document.getElementById('detailModal')).show();
}

function updateProduct() {
  fetch(`${API}/${detailId.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: detailTitle.value,
      price: +detailPrice.value,
      description: detailDesc.value,
      images: [detailImage.value]
    })
  }).then(() => alert('Cập nhật thành công (API fake)'));
}

/* ================= CREATE PRODUCT ================= */
function createProduct() {
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: createTitle.value,
      price: +createPrice.value,
      description: createDesc.value,
      categoryId: 1,
      images: [createImage.value]
    })
  })
    .then(res => res.json())
    .then(p => {
      products.unshift(p);
      filtered = [...products];
      page = 1;
      render();
      bootstrap.Modal.getInstance(createModal).hide();
    });
}
