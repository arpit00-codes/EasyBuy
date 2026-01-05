async function apiAdd(id) {
    const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return res.json();
}

async function apiRemove(id) {
    const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return res.json();
}

function renderAction(id, quantity) {
    const container = document.querySelector(`[data-action-id="${id}"]`);
    if (!container) return;

    if (quantity && quantity > 0) {
        container.innerHTML = `
            <button class="remove-btn w-9 h-9 bg-white border border-gray-300 flex rounded-full items-center justify-center" data-id="${id}"><i class="ri-subtract-line"></i></button>
            <div class="px-3 py-1 rounded-md bg-gray-100 text-black">${quantity}</div>
            <button class="add-btn w-9 h-9 bg-white border border-gray-300 flex rounded-full items-center justify-center" data-id="${id}"><i class="ri-add-line"></i></button>
        `;
        // attach listeners
        container.querySelector('.add-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            const json = await apiAdd(id);
            if (json.success) renderAction(id, json.quantity);
        });

        container.querySelector('.remove-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            const json = await apiRemove(id);
            if (json.success) {
                if (json.quantity > 0) renderAction(id, json.quantity);
                else container.innerHTML = `<button class="add-btn w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-300" data-id="${id}"><i class="ri-add-line"></i></button>`;
            }
        });
    } else {
        container.innerHTML = `<button class="add-btn w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-300" data-id="${id}"><i class="ri-add-line"></i></button>`;
        container.querySelector('.add-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            const json = await apiAdd(id);
            if (json.success) renderAction(id, json.quantity);
        });
    }
}

// initialize listeners for existing add buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action-id]').forEach(el => {
        const btn = el.querySelector('.add-btn');
        if (btn) btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            const json = await apiAdd(id);
            if (json.success) renderAction(id, json.quantity);
        });
    });
});
