// 1. MODELAGEM E TIPOS

type Categoria = "amigo" | "trabalho" | "familia" | "outro";

interface Contato {
    id: number;
    nome: string;
    telefone: string;
    email?: string;
    categoria: Categoria;
    favoritado: boolean;
}

type ContatoCreate = Omit<Contato, "id">;
type ContatoUpdate = Partial<ContatoCreate>;
type ContatoRead = Readonly<Contato>;

// 2. VALIDAÇÃO EM RUNTIME

const categoriasValidas: Categoria[] = ["amigo", "trabalho", "familia", "outro"];

function isCategoriaValida(categoria: any): categoria is Categoria {
    return categoriasValidas.indexOf(categoria) !== -1;
}


// 3. GERENCIAMENTO DE ESTADO

type Listener = () => void;

class Agenda {
    private contatos: Contato[] = [];
    private proximoId: number = 1;
    private ouvintes: Listener[] = [];

    inscrever(ouvinte: Listener): () => void {
        this.ouvintes = [...this.ouvintes, ouvinte];
        return () => {
            this.ouvintes = this.ouvintes.filter(o => o !== ouvinte);
        };
    }

    private notificar(): void {
        this.ouvintes.forEach(ouvinte => ouvinte());
    }

    adicionar(dados: ContatoCreate): void {
        if (!isCategoriaValida(dados.categoria)) {
            alert(`Erro: A categoria '${dados.categoria}' é inválida!`);
            return;
        }
        
        const novoContato: Contato = { ...dados, id: this.proximoId++ };
        this.contatos = [...this.contatos, novoContato]; 
        this.notificar();
    }

    listar(): ContatoRead[] {
        return [...this.contatos];
    }

    obterPorId(id: number): ContatoRead | undefined {
        const contato = this.contatos.find(c => c.id === id);
        return contato ? { ...contato } : undefined;
    }

    atualizar(id: number, dadosParciais: ContatoUpdate): void {
        if (dadosParciais.categoria && !isCategoriaValida(dadosParciais.categoria)) {
            alert(`Erro: A categoria '${dadosParciais.categoria}' é inválida!`);
            return;
        }

        this.contatos = this.contatos.map(c => 
            c.id === id ? { ...c, ...dadosParciais } : c
        );
        this.notificar();
    }

    remover(id: number): void {
        this.contatos = this.contatos.filter(c => c.id !== id);
        this.notificar();
    }
}

// 4. EXPORTAÇÃO DE CAMPOS

function extrairCampos<T, K extends keyof T>(lista: T[], campo: K): T[K][] {
    return lista.map(item => item[campo]);
}

// 5. INTERFACE VISUAL (DOM)

const agenda = new Agenda();
const listaEl = document.getElementById("lista") as HTMLUListElement;

function renderizarLista() {
    if (!listaEl) return;
    listaEl.innerHTML = ""; // Limpa a lista antes de reconstruir

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

const formEl = document.getElementById("form-contato") as HTMLFormElement;

if (formEl) {
    formEl.addEventListener("submit", (evento) => {
        evento.preventDefault(); 
        
        const nomeInput = document.getElementById("input-nome") as HTMLInputElement;
        const telefoneInput = document.getElementById("input-telefone") as HTMLInputElement;
        const categoriaSelect = document.getElementById("select-categoria") as HTMLSelectElement;

        agenda.adicionar({
            nome: nomeInput.value,
            telefone: telefoneInput.value,
            categoria: categoriaSelect.value as any, 
            favoritado: false
        });

        formEl.reset();
    });
}