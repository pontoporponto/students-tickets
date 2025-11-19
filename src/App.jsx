import React, { useState, useEffect } from 'react';
import { Users, Ticket, List, ChevronLeft, ChevronUp, ChevronDown, X } from 'lucide-react';

export default function App() {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [vista, setVista] = useState('turmas');
  const [loading, setLoading] = useState(true);
  const [modalAberta, setModalAberta] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [valorTemporario, setValorTemporario] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    try {
      const dados = localStorage.getItem('escola-bilhetes');
      if (dados) {
        setTurmas(JSON.parse(dados));
      } else {
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
        salvarDados(dadosIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarDados = (novasTurmas) => {
    try {
      localStorage.setItem('escola-bilhetes', JSON.stringify(novasTurmas));
    } catch (error) {
      console.error('Erro ao salvar:', error);
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

  const confirmarValor = () => {
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
    salvarDados(novasTurmas);
    setTurmaSelecionada(novasTurmas.find(t => t.id === turmaSelecionada.id));
    fecharModal();
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
        <div className="text-indigo-600 text-xl">A carregar...</div>
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
                className="w-24 h-24 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center"
              >
                <ChevronUp className="w-16 h-16" strokeWidth={3} />
              </button>

              <div className="text-6xl font-bold text-indigo-600 min-w-[120px] text-center">
                {valorTemporario}
              </div>

              <button
                onClick={decrementar}
                className="w-24 h-24 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center"
              >
                <ChevronDown className="w-16 h-16" strokeWidth={3} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fecharModal}
                className="flex-1 py-4 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarValor}
                className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}