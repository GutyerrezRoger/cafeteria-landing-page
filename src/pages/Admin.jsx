import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function Admin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [logado, setLogado] = useState(false);

  // --- CONTROLO DE ABAS ---
  const [abaAtiva, setAbaAtiva] = useState("cardapio"); // pode ser 'cardapio' ou 'agenda'

  // --- ESTADOS DO CRUD (CARDÁPIO) ---
  const [itensCardapio, setItensCardapio] = useState([]);
  const [secao, setSecao] = useState("lanches");
  const [categoria, setCategoria] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");

  // --- ESTADOS DO CRUD (AGENDA) ---
  const [itensAgenda, setItensAgenda] = useState([]);
  const [dataEvento, setDataEvento] = useState(""); // Ex: 22 Fev
  const [tituloEvento, setTituloEvento] = useState("");
  const [statusEvento, setStatusEvento] = useState("evento"); // evento ou reservado
  const [descEvento, setDescEvento] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLogado(!!user);
    });
    return () => unsubscribe();
  }, []);

  // --- BUSCA OS DADOS EM TEMPO REAL ---
  useEffect(() => {
    if (!logado) return;

    // Busca Cardápio
    const refCardapio = collection(db, "cardapio");
    const unCardapio = onSnapshot(refCardapio, (snapshot) => {
      setItensCardapio(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    // Busca Agenda
    const refAgenda = collection(db, "agenda");
    const unAgenda = onSnapshot(refAgenda, (snapshot) => {
      setItensAgenda(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    return () => {
      unCardapio();
      unAgenda();
    };
  }, [logado]);

  // --- FUNÇÕES DE AÇÃO GERAIS ---
  const fazerLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      setErro("");
    } catch (error) {
      setErro("E-mail ou senha incorretos.");
    }
  };

  const fazerLogout = () => signOut(auth);

  // --- FUNÇÕES DO CARDÁPIO ---
  const adicionarProduto = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "cardapio"), {
        secao,
        categoria,
        nome,
        descricao,
        preco,
        disponivel: true,
      });
      setCategoria("");
      setNome("");
      setDescricao("");
      setPreco("");
    } catch (error) {
      alert("Erro ao adicionar produto!");
    }
  };

  const apagarProduto = async (idProduto) => {
    if (window.confirm("Apagar este produto?"))
      await deleteDoc(doc(db, "cardapio", idProduto));
  };

  const alternarDisponibilidade = async (idProduto, statusAtual) => {
    try {
      const novoStatus = statusAtual === false ? true : false;
      await updateDoc(doc(db, "cardapio", idProduto), {
        disponivel: novoStatus,
      });
    } catch (error) {
      alert("Erro ao atualizar disponibilidade.");
    }
  };

  // --- FUNÇÕES DA AGENDA ---
  const adicionarEvento = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "agenda"), {
        data: dataEvento,
        titulo: tituloEvento,
        status: statusEvento,
        desc: descEvento,
      });
      setDataEvento("");
      setTituloEvento("");
      setDescEvento("");
      setStatusEvento("evento");
    } catch (error) {
      alert("Erro ao adicionar evento!");
    }
  };

  const apagarEvento = async (idEvento) => {
    if (window.confirm("Apagar este evento da agenda?"))
      await deleteDoc(doc(db, "agenda", idEvento));
  };

  const renderizarGrupoCardapio = (tituloSecao, secaoID) => {
    const itensDestaSecao = itensCardapio.filter((i) => i.secao === secaoID);
    const categorias = [...new Set(itensDestaSecao.map((i) => i.categoria))];
    if (categorias.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="font-black text-xl text-cafe-marrom border-b-2 border-cafe-verde/30 pb-2 mb-4 uppercase">
          {tituloSecao}
        </h3>
        {categorias.map((cat) => (
          <details
            key={cat}
            className="group bg-cafe-creme/20 rounded-2xl border border-cafe-marrom/10 mb-3 p-4 open:bg-white transition-colors"
          >
            <summary className="font-bold text-cafe-marrom cursor-pointer list-none flex justify-between items-center">
              {cat}{" "}
              <span className="text-cafe-marrom/40 text-sm">
                ({itensDestaSecao.filter((i) => i.categoria === cat).length}{" "}
                itens)
              </span>
            </summary>
            <div className="mt-4 flex flex-col gap-3">
              {itensDestaSecao
                .filter((i) => i.categoria === cat)
                .map((item) => {
                  const estaIndisponivel = item.disponivel === false;
                  return (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center p-3 rounded-xl border border-cafe-marrom/5 ${estaIndisponivel ? "bg-gray-100 opacity-70 grayscale" : "bg-white shadow-sm"}`}
                    >
                      <div>
                        <h4
                          className={`font-bold ${estaIndisponivel ? "text-gray-500 line-through" : "text-cafe-marrom"}`}
                        >
                          {item.nome}
                        </h4>
                        <p className="text-xs text-cafe-marrom/70">
                          {item.descricao}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cafe-verde text-sm mr-2">
                          {item.preco}
                        </span>
                        <button
                          onClick={() =>
                            alternarDisponibilidade(item.id, item.disponivel)
                          }
                          className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${estaIndisponivel ? "bg-cafe-verde text-white" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
                        >
                          {estaIndisponivel ? "▶ Ativar" : "⏸ Pausar"}
                        </button>
                        <button
                          onClick={() => apagarProduto(item.id)}
                          className="text-red-500 hover:bg-red-50 text-xs font-bold bg-white px-3 py-2 rounded-lg border border-red-100 shadow-sm transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </details>
        ))}
      </div>
    );
  };

  if (logado) {
    return (
      <div className="min-h-screen bg-cafe-creme p-6 md:p-12 font-texto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 border-b border-cafe-marrom/10 pb-4">
            <h1 className="text-3xl font-titulo font-black text-cafe-marrom">
              Painel de Controlo
            </h1>
            <button
              onClick={fazerLogout}
              className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              Sair
            </button>
          </div>

          {/* MENU DE ABAS */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setAbaAtiva("cardapio")}
              className={`px-6 py-3 rounded-xl font-bold transition-colors shadow-sm ${abaAtiva === "cardapio" ? "bg-cafe-verde text-cafe-marrom" : "bg-white text-cafe-marrom/50 hover:bg-cafe-creme/50"}`}
            >
              ☕ Gerir Cardápio
            </button>
            <button
              onClick={() => setAbaAtiva("agenda")}
              className={`px-6 py-3 rounded-xl font-bold transition-colors shadow-sm ${abaAtiva === "agenda" ? "bg-cafe-rosa-forte text-cafe-marrom" : "bg-white text-cafe-marrom/50 hover:bg-cafe-creme/50"}`}
            >
              📅 Gerir Agenda
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* --- ABA: CARDÁPIO --- */}
            {abaAtiva === "cardapio" && (
              <>
                <div className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-cafe-marrom/10 h-fit sticky top-6">
                  <h2 className="font-bold text-cafe-marrom mb-4 text-lg">
                    Novo Produto
                  </h2>
                  <form
                    onSubmit={adicionarProduto}
                    className="flex flex-col gap-3"
                  >
                    <select
                      value={secao}
                      onChange={(e) => setSecao(e.target.value)}
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    >
                      <option value="lanches">Lanches</option>
                      <option value="bebidas">Bebidas</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Categoria (Ex: Doces)"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      required
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    />
                    <input
                      type="text"
                      placeholder="Nome do Produto"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    />
                    <input
                      type="text"
                      placeholder="Descrição (Opcional)"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    />
                    <input
                      type="text"
                      placeholder="Preço (Ex: R$ 10,00)"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      required
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    />
                    <button
                      type="submit"
                      className="bg-cafe-verde text-cafe-marrom font-bold py-4 rounded-xl mt-2 hover:bg-cafe-verde/80 transition-colors"
                    >
                      Salvar Produto
                    </button>
                  </form>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-cafe-marrom/10">
                  <h2 className="font-bold text-cafe-marrom mb-6 text-2xl font-titulo">
                    Cardápio Atual ({itensCardapio.length})
                  </h2>
                  {itensCardapio.length === 0 ? (
                    <p className="text-cafe-marrom/50 text-center py-10">
                      Nenhum produto cadastrado.
                    </p>
                  ) : (
                    <>
                      {renderizarGrupoCardapio("🥐 Lanches", "lanches")}
                      {renderizarGrupoCardapio("☕ Bebidas", "bebidas")}
                    </>
                  )}
                </div>
              </>
            )}

            {/* --- ABA: AGENDA --- */}
            {abaAtiva === "agenda" && (
              <>
                <div className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-cafe-marrom/10 h-fit sticky top-6">
                  <h2 className="font-bold text-cafe-marrom mb-4 text-lg">
                    Novo Evento
                  </h2>
                  <form
                    onSubmit={adicionarEvento}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Data (Ex: 22 Fev)"
                      value={dataEvento}
                      onChange={(e) => setDataEvento(e.target.value)}
                      required
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    />
                    <input
                      type="text"
                      placeholder="Título (Ex: Música ao Vivo)"
                      value={tituloEvento}
                      onChange={(e) => setTituloEvento(e.target.value)}
                      required
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    />
                    <select
                      value={statusEvento}
                      onChange={(e) => setStatusEvento(e.target.value)}
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde"
                    >
                      <option value="evento">
                        Evento Aberto (Música, etc)
                      </option>
                      <option value="reservado">
                        Espaço Fechado (Reservado)
                      </option>
                    </select>
                    <textarea
                      placeholder="Descrição (Opcional)"
                      value={descEvento}
                      onChange={(e) => setDescEvento(e.target.value)}
                      className="p-3 border border-cafe-marrom/20 rounded-lg bg-cafe-creme/30 focus:outline-none focus:border-cafe-verde resize-none h-24"
                    />
                    <button
                      type="submit"
                      className="bg-cafe-rosa-forte text-cafe-marrom font-bold py-4 rounded-xl mt-2 hover:bg-cafe-rosa-forte/80 transition-colors"
                    >
                      Salvar Evento
                    </button>
                  </form>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-cafe-marrom/10">
                  <h2 className="font-bold text-cafe-marrom mb-6 text-2xl font-titulo">
                    Agenda Atual ({itensAgenda.length})
                  </h2>
                  {itensAgenda.length === 0 ? (
                    <p className="text-cafe-marrom/50 text-center py-10">
                      Nenhum evento na agenda.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {itensAgenda.map((evento) => (
                        <div
                          key={evento.id}
                          className="flex justify-between items-center p-4 bg-cafe-creme/30 rounded-xl border border-cafe-marrom/5"
                        >
                          <div>
                            <span className="text-xs font-bold uppercase text-cafe-rosa-forte bg-white px-2 py-1 rounded-md shadow-sm mr-3">
                              {evento.data}
                            </span>
                            <span className="font-bold text-cafe-marrom text-lg">
                              {evento.titulo}
                            </span>
                            <p className="text-sm text-cafe-marrom/60 mt-1">
                              {evento.desc}
                            </p>
                            <span
                              className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md mt-2 inline-block ${evento.status === "reservado" ? "bg-red-100 text-red-500" : "bg-cafe-verde/50 text-cafe-marrom"}`}
                            >
                              {evento.status === "reservado"
                                ? "Espaço Fechado"
                                : "Evento Aberto"}
                            </span>
                          </div>
                          <button
                            onClick={() => apagarEvento(evento.id)}
                            className="text-red-500 hover:bg-red-50 text-sm font-bold bg-white px-4 py-2 rounded-xl border border-red-100 shadow-sm transition-colors"
                          >
                            Apagar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cafe-creme flex items-center justify-center p-4 font-texto">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-cafe-marrom/10">
        <h2 className="text-2xl font-titulo font-black text-cafe-marrom mb-6 text-center">
          Acesso Restrito
        </h2>
        {erro && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded-lg">
            {erro}
          </p>
        )}
        <form onSubmit={fazerLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-lg border border-cafe-marrom/20 focus:outline-none focus:border-cafe-verde bg-cafe-creme/30"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="p-3 rounded-lg border border-cafe-marrom/20 focus:outline-none focus:border-cafe-verde bg-cafe-creme/30"
          />
          <button
            type="submit"
            className="bg-cafe-marrom text-cafe-creme font-bold py-3 rounded-xl hover:bg-cafe-marrom/90 transition-colors shadow-md mt-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
