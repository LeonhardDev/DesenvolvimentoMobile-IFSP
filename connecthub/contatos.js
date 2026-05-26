"use strict";
// 1. MODELAGEM E TIPOS
// 2. VALIDAÇÃO EM RUNTIME
const categoriasValidas = ["amigo", "trabalho", "familia", "outro"];
function isCategoriaValida(categoria) {
    return categoriasValidas.indexOf(categoria) !== -1;
}
class Agenda {
    constructor() {
        this.contatos = [];
        this.proximoId = 1;
        this.ouvintes = [];
    }
    inscrever(ouvinte) {
        this.ouvintes = [...this.ouvintes, ouvinte];
        return () => {
            this.ouvintes = this.ouvintes.filter(o => o !== ouvinte);
        };
    }
    notificar() {
        this.ouvintes.forEach(ouvinte => ouvinte());
    }
    adicionar(dados) {
        if (!isCategoriaValida(dados.categoria)) {
            alert(`Erro: A categoria '${dados.categoria}' é inválida!`);
            return;
        }
        const novoContato = Object.assign(Object.assign({}, dados), { id: this.proximoId++ });
        this.contatos = [...this.contatos, novoContato];
        this.notificar();
    }
    listar() {
        return [...this.contatos];
    }
    obterPorId(id) {
        const contato = this.contatos.find(c => c.id === id);
        return contato ? Object.assign({}, contato) : undefined;
    }
    atualizar(id, dadosParciais) {
        if (dadosParciais.categoria && !isCategoriaValida(dadosParciais.categoria)) {
            alert(`Erro: A categoria '${dadosParciais.categoria}' é inválida!`);
            return;
        }
        this.contatos = this.contatos.map(c => c.id === id ? Object.assign(Object.assign({}, c), dadosParciais) : c);
        this.notificar();
    }
    remover(id) {
        this.contatos = this.contatos.filter(c => c.id !== id);
        this.notificar();
    }
}
// 4. EXPORTAÇÃO DE CAMPOS
function extrairCampos(lista, campo) {
    return lista.map(item => item[campo]);
}
// 5. INTERFACE VISUAL
const agenda = new Agenda();
const listaEl = document.getElementById("lista");
function renderizarLista() {
    if (!listaEl)
        return;
    listaEl.innerHTML = "";
    const contatos = agenda.listar();
    contatos.forEach(contato => {
        const li = document.createElement("li");
        const divInfo = document.createElement("div");
        divInfo.className = "info";
        const spanNome = document.createElement("span");
        spanNome.textContent = contato.nome;
        const spanCat = document.createElement("span");
        spanCat.className = "categoria";
        spanCat.textContent = contato.categoria.charAt(0).toUpperCase() + contato.categoria.slice(1);
        divInfo.appendChild(spanNome);
        divInfo.appendChild(spanCat);
        const divAcoes = document.createElement("div");
        divAcoes.className = "acoes";
        const btnEstrela = document.createElement("button");
        btnEstrela.className = `estrela ${contato.favoritado ? "favoritado" : ""}`;
        btnEstrela.addEventListener("click", () => {
            agenda.atualizar(contato.id, { favoritado: !contato.favoritado });
        });
        const btnRemover = document.createElement("button");
        btnRemover.className = "btn-remover";
        btnRemover.textContent = "Excluir";
        btnRemover.addEventListener("click", () => {
            agenda.remover(contato.id);
        });
        divAcoes.appendChild(btnEstrela);
        divAcoes.appendChild(btnRemover);
        li.appendChild(divInfo);
        li.appendChild(divAcoes);
        listaEl.appendChild(li);
    });
}
// 6. INICIALIZAÇÃO
const cancelarRenderizacao = agenda.inscrever(renderizarLista);
// teste contato
agenda.adicionar({
    nome: "Ada Wong",
    telefone: "11999998888",
    categoria: "trabalho",
    favoritado: true
});
agenda.adicionar({
    nome: "Leon S. Kennedy",
    telefone: "11777776666",
    categoria: "amigo",
    favoritado: false
});
console.log("📝 Nomes da Agenda:", extrairCampos(agenda.listar(), "nome"));
console.log("📞 Telefones da Agenda:", extrairCampos(agenda.listar(), "telefone"));
// 7. INTERAÇÃO COM O FORMULÁRIO
const formEl = document.getElementById("form-contato");
if (formEl) {
    formEl.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const nomeInput = document.getElementById("input-nome");
        const telefoneInput = document.getElementById("input-telefone");
        const categoriaSelect = document.getElementById("select-categoria");
        agenda.adicionar({
            nome: nomeInput.value,
            telefone: telefoneInput.value,
            categoria: categoriaSelect.value,
            favoritado: false
        });
        formEl.reset();
    });
}
