import { getNavBar } from '../components/navbar.js'

const URL_BASE = 'http://localhost:8080/clientes'
const INSERT_STATE = 0
const EDIT_STATE   = 1

$(document).ready(() => {
    $('header').append(getNavBar())

    function FetchRegistros() {
        fetch(URL_BASE)
            .then((res) => res.json())
            .then((dados) => GerarGrid(dados))
            .catch(console.error)
    }

    function GerarGrid(dados) {
        let tableBody = $('#body-table')
        tableBody.empty()

        Object.values(dados).forEach(dado => {
            tableBody.append(`
                <tr>
                    <td>${dado.nome}</td>
                    <td>${dado.cpf}</td>
                    <td>${dado.telefone}</td>
                    <td>${dado.endereco}</td>
                    <td>
                        <button type="button" class="btn btn-outline-danger btn-sm edit" data-id="${dado.id}" data-state="1" data-bs-toggle="modal" data-bs-target="#cliente-modal">
                            <i class="bi bi-pen"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete" data-id="${dado.id}" data-bs-toggle="modal" data-bs-target="#confirm-delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>    
            `)
        })
    }

    $('#cliente-cpf').on('input', function() {
        let value = $(this).val()
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        $(this).val(value)
    })

    $('#cliente-telefone').on('input', function() {
        let value = $(this).val()
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{2})(\d)/, '($1) $2')
        value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2')
        $(this).val(value)
    })

    $('#insert').on('click', () => {
        $('#cliente-nome').val('')
        $('#cliente-cpf').val('')
        $('#cliente-telefone').val('')
        $('#cliente-endereco').val('')

        $('#cliente-modal-label').text('Inserir Cliente')

        $('#cliente-form').removeAttr('data-id')
        $('#cliente-form').attr('data-state', INSERT_STATE)
    })

    $(document).on('click', '.edit', function() {
        let clienteId = $(this).data("id")

        fetch(`${URL_BASE}/${clienteId}`)
            .then(res => res.json())
            .then(cliente => {
                $('#cliente-nome').val(cliente.nome)
                $('#cliente-cpf').val(cliente.cpf)
                $('#cliente-telefone').val(cliente.telefone)
                $('#cliente-endereco').val(cliente.endereco)

                $('#cliente-modal-label').text('Editar Cliente')

                $('#cliente-form').attr('data-id', clienteId)
                $('#cliente-form').attr('data-state', EDIT_STATE)
            })
            .catch(console.error)
    })

    $('#save-cliente').on('click', () => {
        let nome = $('#cliente-nome').val().trim()
        let cpf = $('#cliente-cpf').val().trim()
        let telefone = $('#cliente-telefone').val().trim()
        let endereco = $('#cliente-endereco').val().trim()
        let id = "";

        if (!nome || !cpf || !telefone) {
            alert('Por favor, preencha os campos obrigatórios: Nome, CPF e Telefone.')
            return
        }

        function validarCPF(cpf) {
            cpf = cpf.replace(/[^\d]+/g,'')
            if(cpf == '') return false
            
            if (cpf.length != 11 ||
                cpf == "00000000000" ||
                cpf == "11111111111" ||
                cpf == "22222222222" ||
                cpf == "33333333333" ||
                cpf == "44444444444" ||
                cpf == "55555555555" ||
                cpf == "66666666666" ||
                cpf == "77777777777" ||
                cpf == "88888888888" ||
                cpf == "99999999999")
                    return false
            
            let add = 0
            for (let i = 0; i < 9; i++)
                add += parseInt(cpf.charAt(i)) * (10 - i)
            let rev = 11 - (add % 11)
            if (rev == 10 || rev == 11)
                rev = 0
            if (rev != parseInt(cpf.charAt(9)))
                return false
            
            add = 0
            for (let i = 0; i < 10; i++)
                add += parseInt(cpf.charAt(i)) * (11 - i)
            rev = 11 - (add % 11)
            if (rev == 10 || rev == 11)
                rev = 0
            if (rev != parseInt(cpf.charAt(10)))
                return false
            return true
        }

        let telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

        if (!validarCPF(cpf)) {
            alert('CPF inválido. Por favor, insira um CPF válido.')
            return
        }

        if (!telefoneRegex.test(telefone)) {
            alert('Telefone inválido. Por favor, insira um telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.')
            return
        }

        let state  = $('#cliente-form').attr('data-state')
        let url    = URL_BASE
        let method = 'POST'

        if (state == EDIT_STATE) {
            id     = $('#cliente-form').attr('data-id')
            method = 'PUT'
        }

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json', 
            data: JSON.stringify({
                id: id,
                nome: nome,
                cpf: cpf,
                telefone: telefone,
                endereco: endereco,
                pedidos: []
            }),
            success: () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('cliente-modal'))
                modal.hide()

                FetchRegistros()
            },
            error: (xhr) => {
                let errorMessage = 'Erro ao Salvar Cliente'
                if (xhr.responseText) {
                    errorMessage += ': ' + xhr.responseText
                }
                alert(errorMessage)
            }
        })
    })

    $(document).on('click', '.delete', function() {
        let clienteId = $(this).data("id")

        $('#confirm-delete').attr('data-id', clienteId)
    })

    $('#yes-delete').on('click', function() {
        let clienteId = $('#confirm-delete').attr('data-id')

        $.ajax({
            url: `${URL_BASE}/${clienteId}`,
            method: 'DELETE',
            success: () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirm-delete'))
                modal.hide()

                FetchRegistros()
            },
            error: (xhr) => {
                let errorMessage = 'Erro ao Deletar Cliente'
                if (xhr.responseText) {
                    errorMessage += ': ' + xhr.responseText
                }
                alert(errorMessage)
            }
        })
    })

    FetchRegistros()
})
