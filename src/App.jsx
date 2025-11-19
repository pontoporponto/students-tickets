import React, { useState, useEffect } from 'react';
import { Users, Ticket, List, ChevronLeft, ChevronUp, ChevronDown, X, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyB2j9lG-gAe9fCNP7OFK0wf7gMQrl9qrA7dqFOrI_NYEld2rsBHHhPWzXvXu5oOliR/exec';

export default function App() {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [vista, setVista] = useState('turmas');
  const [loading, setLoading] = useState(true);
  const [modalAberta, setModalAberta] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [valorTemporario, setValorTemporario] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [erro, setErro] = useState(null);
  const [ultimaSync, setUltimaSync] = useState(null);

  useEffect(() => {
    carregarDados();
    
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(() => {
      if (navigator.onLine && !sincronizando) {
        sincronizarComGoogle();
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    
    console.log('Carregando dados... Online:', online);
    console.log('URL configurado:', GOOGLE_SCRIPT_URL);
    
    if (online) {
      console.log('Tentando sincronizar com Google Sheets...');
      try {
        const sucesso = await sincronizarComGoogle();
        if (sucesso) {
          console.log('Dados carregados do Google Sheets com sucesso!');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar do Google:', error);
      }
    } else {
      console.log('Offline - usando dados locais');
    }
    
    try {
      const dados = localStorage.getItem('escola-bilhetes');
      if (dados) {
        console.log('Carregando dados do localStorage');
        setTurmas(JSON.parse(dados));
      } else {
        console.log('Usando dados iniciais padrão');
        const dadosIniciais = [
          { 
            id: '1', 
            nome: '10 A', 
            alunos: [
              { nome: 'Ana Silva', bilhetes: 0 },
              { nome: 'Bruno Costa', bilhetes: 0 },
              { nome: 'Carlos Santos', bilhetes: 0 }
            ] 
          },
          { 
            id: '2', 
            nome: '10 B', 
            alunos: [
              { nome: 'Diana Oliveira', bilhetes: 0 },
              { nome: 'Eduardo Lima', bilhetes: 0 }
            ] 
          },
          { 
            id: '3', 
            nome: '11 A', 
            alunos: [
              { nome: 'Francisca Pinto', bilhetes: 0 },
              { nome: 'Gabriel Sousa', bilhetes: 0 },
              { nome: 'Helena Ferreira', bilhetes: 0 },
              { nome: 'Igor Rocha', bilhetes: 0 }
            ] 
          }
        ];
        setTurmas(dadosIniciais);
        salvarLocal(dadosIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const sincronizarComGoogle = async () => {
    if (!navigator.onLine) {
      console.log('Offline - sincronização ignorada');
      return false;
    }
    
    if (sincronizando) {
      console.log('Já está sincronizando...');
      return false;
    }
    
    setSincronizando(true);
    setErro(null);
    
    try {
      console.log('Iniciando sincronização...');
      
      const url = `${GOOGLE_SCRIPT_URL}?action=getTurmas&t=${Date.now()}`;
      console.log('URL completo:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      console.log('Resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      if (data.success && data.turmas) {
        console.log('Turmas carregadas:', data.turmas.length);
        setTurmas(data.turmas);
        salvarLocal(data.turmas);
        setUltimaSync(new Date());
        setSincronizando(false);
        return true;
      } else {
        throw new Error(data.error || 'Erro ao buscar dados');
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setErro('Erro ao sincronizar: ' + error.message);
      setSincronizando(false);
      return false;
    }
  };

  const salvarLocal = (novasTurmas) => {
    try {
      localStorage.setItem('escola-bilhetes', JSON.stringify(novasTurmas));
    } catch (error) {
      console.error('Erro ao salvar localmente:', error);
    }
  };

  const salvarNoGoogle = async (novasTurmas) => {
    if (!online) {
      return false;
    }
    
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=saveTurmas`, {
        method: 'POST',
        body: JSON.stringify({ turmas: novasTurmas })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao salvar no Google:', error);
      return false;
    }
  };

  const logPedidoNoGoogle = async (turma, aluno, bilhetes) => {
    if (!online) {
      return;
    }
    
    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?action=logPedido`, {
        method: 'POST',
        body: JSON.stringify({
          turma: turma,
          aluno: aluno,
          bilhetes: bilhetes,
          usuario: 'App Web'
        })
      });
    } catch (error) {
      console.error('Erro ao registar log:', error);
    }
  };

  const abrirModal = (aluno) => {
    setAlunoSelecionado(aluno);
    setValorTemporario(aluno.bilhetes);
    setModalAberta(true);
  };

  const fecharModal = () => {
    setModalAberta(false);
    setAlunoSelecionado(null);
  };

  const incrementar = () => {
    setValorTemporario(prev => prev + 1);
  };

  const decrementar = () => {
    setValorTemporario(prev => Math.max(0, prev - 1));
  };

  const confirmarValor = async () => {
    if (salvando) return;
    
    setSalvando(true);
    
    try {
      const novasTurmas = turmas.map(t =>
        t.id === turmaSelecionada.id
          ? {
              ...t,
              alunos: t.alunos.map(a =>
                a.nome === alunoSelecionado.nome ? { ...a, bilhetes: valorTemporario } : a
              )
            }
          : t
      );
      
      setTurmas(novasTurmas);
      salvarLocal(novasTurmas);
      
      await salvarNoGoogle(novasTurmas);
      await logPedidoNoGoogle(
        turmaSelecionada.nome,
        alunoSelecionado.nome,
        valorTemporario
      );
      
      setTurmaSelecionada(novasTurmas.find(t => t.id === turmaSelecionada.id));
      fecharModal();
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      setErro('Erro ao salvar pedido');
    } finally {
      setSalvando(false);
    }
  };

  const obterAlunosComBilhetes = () => {
    const alunosComBilhetes = [];
    turmas.forEach(turma => {
      turma.alunos.forEach(aluno => {
        if (aluno.bilhetes > 0) {
          alunosComBilhetes.push({
            nome: aluno.nome,
            turma: turma.nome,
            bilhetes: aluno.bilhetes
          });
        }
      });
    });
    return alunosComBilhetes.sort((a, b) => b.bilhetes - a.bilhetes);
  };

  const totalBilhetes = obterAlunosComBilhetes().reduce((sum, a) => sum + a.bilhetes, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <div className="text-indigo-600 text-xl">A carregar dados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">Pedidos de Bilhetes</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total de bilhetes</div>
              <div className="text-2xl font-bold text-indigo-600">{totalBilhetes}</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {online ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-600">Offline</span>
                </>
              )}
            </div>
            
            {online && (
              <button
                onClick={sincronizarComGoogle}
                disabled={sincronizando}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
                <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}
          </div>
          
          {ultimaSync && (
            <div className="mt-2 text-xs text-gray-500">
              Ultima sincronizacao: {ultimaSync.toLocaleTimeString()}
            </div>
          )}
          
          {erro && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-orange-800">{erro}</span>
            </div>
          )}
        </div>

        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => { setVista('turmas'); setTurmaSelecionada(null); }}
            className={`flex-1 py-4 px-6 font-medium transition ${
              vista === 'turmas' && !turmaSelecionada
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Turmas
            </div>
          </button>
          <button
            onClick={() => { setVista('relatorio'); setTurmaSelecionada(null); }}
            className={`flex-1 py-4 px-6 font-medium transition ${
              vista === 'relatorio'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <List className="w-5 h-5" />
              Relatorio ({obterAlunosComBilhetes().length})
            </div>
          </button>
        </div>

        {vista === 'turmas' && !turmaSelecionada ? (
          <div className="bg-white rounded-b-2xl shadow-lg p-6">
            <div className="space-y-3">
              {turmas.map(turma => {
                const alunosComBilhetes = turma.alunos.filter(a => a.bilhetes > 0).length;
                const totalTurma = turma.alunos.reduce((sum, a) => sum + a.bilhetes, 0);
                
                return (
                  <div
                    key={turma.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition cursor-pointer"
                    onClick={() => { setTurmaSelecionada(turma); setVista('turmas'); }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">{turma.nome}</h3>
                        <p className="text-sm text-gray-600">{turma.alunos.length} alunos</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Pedidos</div>
                        <div className="text-2xl font-bold text-indigo-600">{totalTurma}</div>
                        <div className="text-xs text-gray-500">{alunosComBilhetes} alunos</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : vista === 'turmas' && turmaSelecionada ? (
          <div className="bg-white rounded-b-2xl shadow-lg p-6">
            <button
              onClick={() => setTurmaSelecionada(null)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar as turmas
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">{turmaSelecionada.nome}</h2>
            <p className="text-gray-600 mb-6">Toque num aluno para registar bilhetes</p>

            <div className="space-y-3">
              {turmaSelecionada.alunos.map((aluno, idx) => (
                <div
                  key={idx}
                  onClick={() => abrirModal(aluno)}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg">{aluno.nome}</div>
                      {aluno.bilhetes > 0 && (
                        <div className="text-sm text-indigo-600 mt-1 font-medium">
                          {aluno.bilhetes} bilhetes pedidos
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {aluno.bilhetes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-b-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Alunos com Pedidos de Bilhetes</h2>
            
            {obterAlunosComBilhetes().length > 0 ? (
              <div className="space-y-3">
                {obterAlunosComBilhetes().map((aluno, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-800">{aluno.nome}</div>
                        <div className="text-sm text-gray-600">{aluno.turma}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{aluno.bilhetes}</div>
                        <div className="text-xs text-gray-600">bilhetes</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-5 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-800 text-lg">Total Geral</div>
                    <div className="text-3xl font-bold text-indigo-600">{totalBilhetes}</div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {obterAlunosComBilhetes().length} alunos com pedidos
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Ainda nao ha pedidos de bilhetes registados</p>
                <p className="text-sm mt-2">Va as turmas para comecar a registar pedidos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modalAberta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Registar Bilhetes</h3>
              <button
                onClick={fecharModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="text-lg font-semibold text-gray-700 mb-2">{alunoSelecionado?.nome}</div>
              <div className="text-sm text-gray-500">{turmaSelecionada?.nome}</div>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <button
                onClick={incrementar}
                disabled={salvando}
                className="w-24 h-24 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-16 h-16" strokeWidth={3} />
              </button>

              <div className="text-6xl font-bold text-indigo-600 min-w-[120px] text-center">
                {valorTemporario}
              </div>

              <button
                onClick={decrementar}
                disabled={salvando}
                className="w-24 h-24 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-16 h-16" strokeWidth={3} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fecharModal}
                disabled={salvando}
                className="flex-1 py-4 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarValor}
                disabled={salvando}
                className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}