import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Coffee,
  MapPin,
  Clock,
  Instagram,
  CalendarHeart,
  Music,
  Lock,
  X,
} from "lucide-react";

function Home() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("lanches");
  const [modalReservaAberto, setModalReservaAberto] = useState(false);
  const [mostrarAgenda, setMostrarAgenda] = useState(false);

  // --- ESTADOS DO CARDÁPIO E AGENDA ---
  const [menu, setMenu] = useState({ lanches: [], bebidas: [] });
  const [carregandoMenu, setCarregandoMenu] = useState(true);
  const [agenda, setAgenda] = useState([]);
  const [carregandoAgenda, setCarregandoAgenda] = useState(true);

  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataReserva, setDataReserva] = useState("");
  const [convidados, setConvidados] = useState("");

  // --- INTEGRAÇÃO COM FIREBASE (PORTFÓLIO) ---
  useEffect(() => {
    // 1. BUSCA O CARDÁPIO
    const referenciaCardapio = collection(db, "cardapio");
    const unsubscribeMenu = onSnapshot(referenciaCardapio, (snapshot) => {
      const menuOrganizado = { lanches: [], bebidas: [] };

      snapshot.forEach((doc) => {
        const linha = doc.data();
        if (!linha.secao || !linha.nome) return;

        const secao = linha.secao.toLowerCase().trim();
        const categoria = linha.categoria.trim();

        if (menuOrganizado[secao]) {
          let grupoCategoria = menuOrganizado[secao].find(
            (c) => c.categoria === categoria,
          );
          if (!grupoCategoria) {
            grupoCategoria = { categoria: categoria, itens: [] };
            menuOrganizado[secao].push(grupoCategoria);
          }
          grupoCategoria.itens.push({
            nome: linha.nome.trim(),
            desc: linha.descricao ? linha.descricao.trim() : "",
            preco: linha.preco.trim(),
            disponivel: linha.disponivel,
          });
        }
      });
      setMenu(menuOrganizado);
      setCarregandoMenu(false);
    });

    // 2. BUSCA A AGENDA
    const referenciaAgenda = collection(db, "agenda");
    const unsubscribeAgenda = onSnapshot(referenciaAgenda, (snapshot) => {
      const agendaOrganizada = snapshot.docs.map((doc) => {
        const linha = doc.data();
        return {
          id: doc.id,
          data: linha.data,
          titulo: linha.titulo,
          status: linha.status || "evento",
          desc: linha.desc || "",
        };
      });
      setAgenda(agendaOrganizada);
      setCarregandoAgenda(false);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeAgenda();
    };
  }, []);

  const subCategoriasExibidas =
    categoriaAtiva === "lanches" ? menu.lanches : menu.bebidas;

  const enviarReserva = (e) => {
    e.preventDefault();
    if (!nome || !dataReserva || !convidados) {
      alert(
        "Por favor, preencha o seu nome, a data e a quantidade de convidados para podermos reservar!",
      );
      return;
    }

    // NÚMERO DE WHATSAPP FICTÍCIO PARA O PORTFÓLIO
    const numeroCafe = "5511999999999";

    const texto = `Olá! Vim pelo site e gostaria de fazer uma reserva para o Primeiro Andar.%0A%0A*Nome:* ${nome}%0A*WhatsApp:* ${telefone}%0A*Data desejada:* ${dataReserva.split("-").reverse().join("/")}%0A*Quantidade de pessoas:* ${convidados}%0A%0AAguardo a confirmação, obrigado!`;
    const linkWhatsapp = `https://wa.me/${numeroCafe}?text=${texto}`;
    window.open(linkWhatsapp, "_blank");

    setModalReservaAberto(false);
    setNome("");
    setTelefone("");
    setDataReserva("");
    setConvidados("");
  };

  return (
    <div className="min-h-screen font-texto relative bg-cafe-creme">
      {/* 1. HERO SECTION */}
      <header className="bg-cafe-rosa-claro px-6 py-16 md:py-24 rounded-b-[3rem] shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-1/2">
            <span className="flex items-center gap-2 bg-cafe-verde text-cafe-marrom px-4 py-1.5 rounded-full font-bold tracking-widest uppercase mb-6 text-xs shadow-sm">
              <Coffee size={14} /> Café & Leitura Exemplo
            </span>
            <h1 className="font-titulo text-5xl md:text-7xl font-black text-cafe-marrom mb-6 leading-tight italic">
              Sinta a vibe,
              <br /> Saboreie o momento
            </h1>
            <p className="text-cafe-marrom/80 mb-8 max-w-md md:text-lg">
              Livros, cafés especiais e um cantinho no primeiro andar só para
              você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs md:max-w-md mx-auto md:mx-0">
              <button
                onClick={() => {
                  setMostrarAgenda(!mostrarAgenda);
                  if (!mostrarAgenda) {
                    setTimeout(() => {
                      document
                        .getElementById("agenda")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className="flex items-center justify-center gap-2 w-full bg-transparent border-2 border-cafe-marrom text-cafe-marrom px-6 py-3 rounded-full font-bold hover:bg-cafe-marrom hover:text-cafe-creme transition-colors"
              >
                <CalendarHeart size={18} />
                {mostrarAgenda ? "Ocultar Agenda" : "Ver Agenda"}
              </button>
              <button
                onClick={() => setModalReservaAberto(true)}
                className="w-full bg-cafe-marrom text-cafe-creme px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Fazer Reserva
              </button>
            </div>
          </div>
          <div className="hidden md:flex md:w-1/2 justify-center items-center">
            <img
              src="/Home.png"
              alt="Ilustração Cafeteria"
              className="w-full max-w-md mix-blend-multiply"
            />
          </div>
        </div>
      </header>

      {/* 2. MENU / CARDÁPIO */}
      <section className="px-6 py-16 max-w-6xl mx-auto min-h-[50vh]">
        <h2 className="font-titulo text-4xl md:text-5xl font-black text-center text-cafe-marrom mb-12">
          Nosso Cardápio
        </h2>
        {carregandoMenu ? (
          <div className="flex flex-col items-center justify-center text-cafe-marrom/50 animate-pulse">
            <Coffee size={40} className="mb-4" />
            <p className="font-bold tracking-widest uppercase text-sm">
              A carregar o banco de dados...
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-4 justify-center mb-12 sticky top-4 bg-cafe-creme/90 p-2 rounded-full backdrop-blur-sm shadow-sm z-10 w-fit mx-auto">
              <button
                onClick={() => setCategoriaAtiva("lanches")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-colors ${categoriaAtiva === "lanches" ? "bg-cafe-verde text-cafe-marrom" : "bg-transparent text-gray-500 hover:bg-gray-200"}`}
              >
                Lanches
              </button>
              <button
                onClick={() => setCategoriaAtiva("bebidas")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-colors ${categoriaAtiva === "bebidas" ? "bg-cafe-rosa-forte text-cafe-marrom" : "bg-transparent text-gray-500 hover:bg-gray-200"}`}
              >
                <Coffee size={16} /> Bebidas
              </button>
            </div>

            {subCategoriasExibidas.length === 0 ? (
              <p className="text-center text-cafe-marrom/60 mt-10">
                Conecte o seu Firebase para ver os produtos.
              </p>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 md:items-start">
                {subCategoriasExibidas.map((sub, index) => (
                  <details
                    key={index}
                    className="group bg-white rounded-3xl shadow-sm border border-cafe-marrom/10 p-6 open:bg-cafe-rosa-claro/20 transition-colors"
                  >
                    <summary className="font-titulo text-2xl md:text-3xl font-bold text-cafe-marrom cursor-pointer list-none flex justify-between items-center pb-2 border-b-2 border-cafe-verde/30">
                      {sub.categoria}
                      <span className="text-cafe-verde group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-6 flex flex-col gap-4">
                      {sub.itens.map((item, i) => (
                        <div
                          key={i}
                          className={`flex justify-between items-end border-b border-cafe-marrom/5 pb-3 ${item.disponivel === false ? "opacity-60 grayscale" : ""}`}
                        >
                          <div className="pr-4">
                            <h3 className="font-bold text-base md:text-lg text-cafe-marrom flex flex-wrap items-center gap-2">
                              {item.nome}
                              {item.disponivel === false && (
                                <span className="text-[10px] uppercase font-black tracking-widest bg-red-100 text-red-500 px-2 py-0.5 rounded-md">
                                  Esgotado
                                </span>
                              )}
                            </h3>
                            {item.desc && (
                              <p className="text-xs md:text-sm text-cafe-marrom/60 mt-1">
                                {item.desc}
                              </p>
                            )}
                          </div>
                          <span
                            className={`font-bold px-3 py-1 rounded-lg whitespace-nowrap ml-4 text-sm md:text-base ${item.disponivel === false ? "bg-gray-200 text-gray-500" : "bg-cafe-verde/40 text-cafe-marrom"}`}
                          >
                            {item.preco}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 3. AGENDA DINÂMICA */}
      {mostrarAgenda && (
        <section id="agenda" className="px-6 pb-16 pt-4 max-w-3xl mx-auto">
          <div className="bg-cafe-marrom text-cafe-creme p-8 md:p-12 rounded-[3rem] shadow-2xl relative min-h-[30vh]">
            <button
              onClick={() => setMostrarAgenda(false)}
              className="absolute top-6 right-6 text-cafe-creme/50 hover:text-cafe-verde transition-colors p-2"
              title="Fechar Agenda"
            >
              <X size={24} />
            </button>
            <h2 className="font-titulo text-4xl md:text-5xl font-black text-center text-cafe-verde mb-2">
              Datas Ocupadas
            </h2>
            <p className="text-center text-cafe-creme/80 mb-10 md:text-lg">
              Os dias que não estão nesta lista estão{" "}
              <strong className="text-cafe-rosa-forte">livres</strong> para
              reserva!
            </p>

            {carregandoAgenda ? (
              <div className="flex flex-col items-center justify-center text-cafe-creme/50 animate-pulse my-10">
                <CalendarHeart size={40} className="mb-4" />
                <p className="font-bold tracking-widest uppercase text-sm">
                  A carregar a programação...
                </p>
              </div>
            ) : agenda.length === 0 ? (
              <div className="text-center bg-cafe-creme/10 p-6 rounded-2xl mb-10">
                <p className="font-bold text-lg text-cafe-verde">
                  A agenda está livre!
                </p>
                <p className="text-sm text-cafe-creme/80 mt-2">
                  Nenhum evento programado. Aproveite para reservar o seu dia.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 mb-10">
                {agenda.map((dia, index) => (
                  <div
                    key={index}
                    className="bg-cafe-creme text-cafe-marrom p-4 md:p-6 rounded-2xl shadow-md flex gap-4 md:gap-6 items-center hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex flex-col items-center justify-center bg-cafe-rosa-forte rounded-xl p-3 md:p-4 min-w-[70px] md:min-w-[90px]">
                      <span className="text-xs md:text-sm uppercase font-bold text-cafe-marrom/70">
                        {dia.data.split(" ")[1] || ""}
                      </span>
                      <span className="font-titulo text-2xl md:text-3xl font-black">
                        {dia.data.split(" ")[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl leading-tight mb-1">
                        {dia.titulo}
                      </h3>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-cafe-marrom/80 font-bold uppercase tracking-wider">
                        {dia.status === "evento" ? (
                          <>
                            <Music size={14} className="text-cafe-verde" />{" "}
                            Evento Aberto
                          </>
                        ) : (
                          <>
                            <Lock size={14} className="text-red-400" /> Espaço
                            Fechado
                          </>
                        )}
                      </div>
                      {dia.desc && (
                        <p className="text-xs md:text-sm text-cafe-marrom/70 mt-2 leading-tight">
                          {dia.desc}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setModalReservaAberto(true)}
              className="w-full bg-cafe-verde text-cafe-marrom font-bold py-4 rounded-xl hover:bg-cafe-verde/90 transition-colors shadow-lg text-lg md:text-xl md:w-1/2 md:mx-auto block"
            >
              Quero Reservar um Dia Livre
            </button>
          </div>
        </section>
      )}

      {/* 4. MODAL DE RESERVA */}
      {modalReservaAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cafe-creme w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalReservaAberto(false)}
              className="absolute top-4 right-4 text-cafe-marrom/50 hover:text-cafe-marrom font-bold text-xl"
            >
              ✕
            </button>
            <h2 className="font-titulo text-3xl font-black text-cafe-marrom mb-2 text-center mt-2">
              Sua Reserva
            </h2>
            <p className="text-center text-sm text-cafe-marrom/70 mb-6">
              Música, café e o seu espaço garantido.
            </p>
            <form onSubmit={enviarReserva} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-cafe-marrom/70 uppercase">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onInvalid={(e) =>
                    e.target.setCustomValidity(
                      "Por favor, informe o seu nome completo para a reserva.",
                    )
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  className="w-full mt-1 p-3 rounded-lg border border-cafe-marrom/20 bg-white focus:outline-none focus:border-cafe-verde"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-cafe-marrom/70 uppercase">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg border border-cafe-marrom/20 bg-white focus:outline-none focus:border-cafe-verde"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-xs font-bold text-cafe-marrom/70 uppercase">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={dataReserva}
                    onChange={(e) => setDataReserva(e.target.value)}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Por favor, escolha uma data para a sua reserva.",
                      )
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    className="w-full mt-1 p-3 rounded-lg border border-cafe-marrom/20 bg-white focus:outline-none focus:border-cafe-verde text-cafe-marrom min-w-0"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-cafe-marrom/70 uppercase">
                    Convidados
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={convidados}
                    onChange={(e) => setConvidados(e.target.value)}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Por favor, informe a quantidade de convidados.",
                      )
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    className="w-full mt-1 p-3 rounded-lg border border-cafe-marrom/20 bg-white focus:outline-none focus:border-cafe-verde min-w-0"
                    placeholder="Qtd"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-cafe-marrom text-cafe-creme font-bold py-4 rounded-xl hover:bg-cafe-marrom/90 transition-colors shadow-lg mt-4"
              >
                Confirmar Reserva no WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. FOOTER COM DADOS FICTÍCIOS */}
      <footer className="bg-cafe-marrom text-cafe-creme px-6 py-12 mt-12 rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10 text-sm text-center md:text-left">
          <div className="md:w-1/3 flex flex-col items-center md:items-start">
            <p className="text-cafe-creme/70 max-w-xs">
              A cafeteria perfeita para quem ama um bom livro, cafés especiais e
              criar memórias.
            </p>
          </div>
          <div className="md:w-1/3 flex flex-col items-center md:items-start gap-6">
            <a
              href="#"
              className="group flex flex-col items-center md:items-start hover:text-cafe-verde transition-colors"
            >
              <h4 className="flex items-center gap-2 font-bold mb-2 text-cafe-rosa-forte uppercase tracking-widest text-xs group-hover:text-cafe-verde transition-colors">
                <MapPin size={16} /> Onde Estamos
              </h4>
              <p>Rua Fictícia dos Grãos, 123</p>
              <p>Bairro do Café - SP</p>
            </a>
            <a
              href="#"
              className="group flex flex-col items-center md:items-start hover:text-cafe-verde transition-colors"
            >
              <h4 className="flex items-center gap-2 font-bold mb-2 text-cafe-rosa-forte uppercase tracking-widest text-xs group-hover:text-cafe-verde transition-colors">
                <Instagram size={16} /> Redes Sociais
              </h4>
              <p className="font-bold tracking-wider">@cafee_leitura_exemplo</p>
            </a>
          </div>
          <div className="md:w-1/3 flex flex-col items-center md:items-start w-full">
            <div className="w-full max-w-xs">
              <h4 className="flex items-center justify-center md:justify-start gap-2 font-bold text-cafe-rosa-forte uppercase tracking-widest text-xs mb-4">
                <Clock size={16} /> Horário de Funcionamento
              </h4>
              <ul className="text-cafe-creme/90 space-y-2 text-sm text-center md:text-left">
                <li className="flex justify-between gap-4 border-b border-cafe-creme/10 pb-1">
                  <span className="font-bold text-cafe-verde">Seg e Ter</span>
                  <span>13h às 19h</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-cafe-creme/10 pb-1">
                  <span className="font-bold text-cafe-rosa-forte">Quarta</span>
                  <span className="text-cafe-rosa-forte font-bold">
                    FECHADO
                  </span>
                </li>
                <li className="flex justify-between gap-4 border-b border-cafe-creme/10 pb-1">
                  <span className="font-bold text-cafe-verde">Qui e Sex</span>
                  <span>13h às 20h</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-cafe-creme/10 pb-1">
                  <span className="font-bold text-cafe-verde">Sábado</span>
                  <span>13h às 20h</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="font-bold text-cafe-verde">Domingo</span>
                  <span>16h às 20h</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
