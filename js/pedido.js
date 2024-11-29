import { getNavBar } from '../components/navbar.js'

const URL_BASE = 'http://localhost:8080/pedidos'
const URL_CLIENTES = 'http://localhost:8080/clientes'
const INSERT_STATE = 0
const EDIT_STATE   = 1

const status = {
    "PROCESSAMENTO": "Em Processamento 🕕",
    "ENVIADO": "Pedido Enviado 🚛",
    "ENTREGUE": "Pedido Entregue 🎉",
    "CANCELADO": "Pedido Cancelado ☹️"
}

$(document).ready(() => {
  $('header').append(getNavBar())

  function FetchRegistros() {
    fetch(URL_CLIENTES)
      .then((res) => res.json())
      .then((dados) => GerarGrid(dados))
      .catch(console.error)
  }

  function GerarGrid(clientes) {
    let tableBody = $('#body-table');
    tableBody.empty();
  
    clientes.forEach(cliente => {
      cliente.pedidos.forEach(pedido => {
        tableBody.append(`
          <tr>
            <td>${pedido.descricao}</td>
            <td>R$ ${parseFloat(pedido.valor).toFixed(2)}</td>
            <td>${status[pedido.status]}</td>
            <td>${cliente.nome}</td>
            <td>
              <button type="button" class="btn btn-outline-danger btn-sm edit" data-id="${pedido.id}" data-bs-toggle="modal" data-bs-target="#pedido-modal">
                <i class="bi bi-pen"></i>
              </button>
              <button type="button" class="btn btn-outline-danger btn-sm delete" data-id="${pedido.id}" data-bs-toggle="modal" data-bs-target="#confirm-delete">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>    
        `);
      });
    });
  }

  function LoadClientes(selectedClienteId = null) {
    fetch(URL_CLIENTES)
      .then(res => res.json())
      .then(clientes => {
        let clienteSelect = $('#pedido-cliente')
        clienteSelect.empty()
        clienteSelect.append('<option value="">Selecione um cliente</option>')
        clientes.forEach(cliente => {
          let selected = cliente.id == selectedClienteId ? 'selected' : ''
          clienteSelect.append(`
            <option value="${cliente.id}" ${selected} data-id="${cliente.id}">
              ${cliente.nome} - <small>${cliente.cpf}</small>
            </option>
          `)
        })
      })
      .catch(console.error)
  }

  $('#pedido-valor').on('input', function() {
    let value = $(this).val()
    value = value.replace(/\D/g, '')
    value = (value / 100).toFixed(2) + ''
    value = value.replace('.', ',')
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    $(this).val(value)
  })

  $('#insert').on('click', () => {
    $('#pedido-descricao').val('')
    $('#pedido-valor').val('')
    $('#pedido-status').val('')
    $('#pedido-cliente').val('')

    $('#pedido-modal-label').text('Inserir Pedido')

    $('#pedido-form').removeAttr('data-id')
    $('#pedido-form').attr('data-state', INSERT_STATE)

    LoadClientes()
  })

  $(document).on('click', '.edit', function() {
    let pedidoId = $(this).data("id")

    fetch(`${URL_BASE}/${pedidoId}`)
      .then(res => res.json())
      .then(pedido => {
        $('#pedido-descricao').val(pedido.descricao)
        $('#pedido-valor').val(pedido.valor.toFixed(2).replace('.', ','))
        $('#pedido-status').val(pedido.status)

        $('#pedido-modal-label').text('Editar Pedido')

        $('#pedido-form').attr('data-id', pedidoId)
        $('#pedido-form').attr('data-state', EDIT_STATE)

        LoadClientes(pedido.cliente.id)
      })
      .catch(console.error)
  })

  $('#save-pedido').on('click', () => {
    let id = ""
    let descricao = $('#pedido-descricao').val().trim()
    let valor = $('#pedido-valor').val().trim()
    let status = $('#pedido-status').val()
    let clienteId = $('#pedido-cliente option:selected').data('id')

    if (!descricao || !valor || !status || !clienteId) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    valor = valor.replace(/\./g, '').replace(',', '.')

    let state  = $('#pedido-form').attr('data-state')
    let url    = URL_BASE
    let method = 'POST'

    if (state == EDIT_STATE) {
      id     = $('#pedido-form').attr('data-id')
      method = 'PUT'
    }

    $.ajax({
      url: url,
      method: method,
      contentType: 'application/json', 
      data: JSON.stringify({
        id: id,
        descricao: descricao,
        valor: parseFloat(valor),
        status: status,
        clienteId: clienteId
      }),
      success: () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('pedido-modal'))
        modal.hide()

        FetchRegistros()
      },
      error: (xhr) => {
        let errorMessage = 'Erro ao Salvar Pedido'
        if (xhr.responseText) {
          errorMessage += ': ' + xhr.responseText
        }
        alert(errorMessage)
      }
    })
  })

  $(document).on('click', '.delete', function() {
    let pedidoId = $(this).data("id")
    $('#confirm-delete').attr('data-id', pedidoId)
  })

  $('#yes-delete').on('click', function() {
    let pedidoId = $('#confirm-delete').attr('data-id')

    $.ajax({
      url: `${URL_BASE}/${pedidoId}`,
      method: 'DELETE',
      success: () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirm-delete'))
        modal.hide()

        FetchRegistros()
      },
      error: (xhr) => {
        let errorMessage = 'Erro ao Deletar Pedido'
        if (xhr.responseText) {
          errorMessage += ': ' + xhr.responseText
        }
        alert(errorMessage)
      }
    })
  })

  FetchRegistros()
})
