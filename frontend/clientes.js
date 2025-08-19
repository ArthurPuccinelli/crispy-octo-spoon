import { supabase } from './supabaseClient.js';

const tableBody = document.querySelector('#clientes-table tbody');
const form = document.getElementById('cliente-form');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const idInput = document.getElementById('cliente-id');
const cancelarBtn = document.getElementById('cancelar-edicao');

async function listarClientes() {
  const { data, error } = await supabase.from('clientes').select('*');
  tableBody.innerHTML = '';
  if (error) {
    alert('Erro ao buscar clientes');
    return;
  }
  data.forEach(cliente => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.email}</td>
      <td>
        <button onclick="editarCliente('${cliente.id}', '${cliente.nome}', '${cliente.email}')">Editar</button>
        <button onclick="excluirCliente('${cliente.id}')">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

window.editarCliente = (id, nome, email) => {
  idInput.value = id;
  nomeInput.value = nome;
  emailInput.value = email;
  cancelarBtn.style.display = 'inline';
};

window.excluirCliente = async (id) => {
  if (!confirm('Deseja realmente excluir este cliente?')) return;
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) alert('Erro ao excluir cliente');
  listarClientes();
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const id = idInput.value;
  const nome = nomeInput.value;
  const email = emailInput.value;
  if (id) {
    // Atualizar
    const { error } = await supabase.from('clientes').update({ nome, email }).eq('id', id);
    if (error) alert('Erro ao atualizar cliente');
  } else {
    // Criar
    const { error } = await supabase.from('clientes').insert([{ nome, email }]);
    if (error) alert('Erro ao criar cliente');
  }
  form.reset();
  cancelarBtn.style.display = 'none';
  listarClientes();
};

cancelarBtn.onclick = () => {
  form.reset();
  cancelarBtn.style.display = 'none';
};

listarClientes();
