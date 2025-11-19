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
            nome: '10º A', 
            alunos: [
              { nome: 'Ana Silva', bilhetes: 0 },
              { nome: 'Bruno Costa', bilhetes: 0 },
              { nome: 'Carlos Santos', bilhetes: 0 }
            ] 
          },
          { 
            id: '2', 
            nome: '10º B', 
            alunos: [
              { nome: 'Diana Oliveira', bilhetes: 0 },
              { nome: 'Eduardo Lima', bilhetes: 0 }
            ] 
          },
          { 
            id: '3', 
            nome: '11º A', 
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
      
        A carregar...
      
    );
  }

  return (
    
      
        {/* Header */}
        
          
            
              
              Pedidos de Bilhetes
            
            
              Total de bilhetes
              {totalBilhetes}
            
          
        

        {/* Navegação */}
        
          <button
            onClick={() => { setVista('turmas'); setTurmaSelecionada(null); }}
            className={`flex-1 py-4 px-6 font-medium transition ${
              vista === 'turmas' && !turmaSelecionada
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            
              
              Turmas
            
          
          <button
            onClick={() => { setVista('relatorio'); setTurmaSelecionada(null); }}
            className={`flex-1 py-4 px-6 font-medium transition ${
              vista === 'relatorio'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            
              
              Relatório ({obterAlunosComBilhetes().length})
            
          
        

        {vista === 'turmas' && !turmaSelecionada ? (
          /* Lista de Turmas */
          
            
              {turmas.map(turma => {
                const alunosComBilhetes = turma.alunos.filter(a => a.bilhetes > 0).length;
                const totalTurma = turma.alunos.reduce((sum, a) => sum + a.bilhetes, 0);
                
                return (
                  <div
                    key={turma.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition cursor-pointer"
                    onClick={() => { setTurmaSelecionada(turma); setVista('turmas'); }}
                  >
                    
                      
                        {turma.nome}
                        {turma.alunos.length} aluno(s)
                      
                      
                        Pedidos
                        {totalTurma}
                        {alunosComBilhetes} aluno(s)
                      
                    
                  
                );
              })}
            
          
        ) : vista === 'turmas' && turmaSelecionada ? (
          /* Detalhes da Turma */
          
            <button
              onClick={() => setTurmaSelecionada(null)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
            >
              
              Voltar às turmas
            

            {turmaSelecionada.nome}
            Toque num aluno para registar bilhetes

            
              {turmaSelecionada.alunos.map((aluno, idx) => (
                <div
                  key={idx}
                  onClick={() => abrirModal(aluno)}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition cursor-pointer"
                >
                  
                    
                      {aluno.nome}
                      {aluno.bilhetes > 0 && (
                        
                          {aluno.bilhetes} bilhete(s) pedido(s)
                        
                      )}
                    
                    
                      {aluno.bilhetes}
                    
                  
                
              ))}
            
          
        ) : (
          /* Relatório */
          
            Alunos com Pedidos de Bilhetes
            
            {obterAlunosComBilhetes().length > 0 ? (
              
                {obterAlunosComBilhetes().map((aluno, idx) => (
                  
                    
                      
                        {aluno.nome}
                        {aluno.turma}
                      
                      
                        {aluno.bilhetes}
                        bilhetes
                      
                    
                  
                ))}
                
                
                  
                    Total Geral
                    {totalBilhetes}
                  
                  
                    {obterAlunosComBilhetes().length} aluno(s) com pedidos
                  
                
              
            ) : (
              
                
                Ainda não há pedidos de bilhetes registados
                Vá às turmas para começar a registar pedidos
              
            )}
          
        )}
      

      {/* Modal */}
      {modalAberta && (
        
          
            
              Registar Bilhetes
              
                
              
            

            
              {alunoSelecionado?.nome}
              {turmaSelecionada?.nome}
            

            
              
                
              

              
                {valorTemporario}
              

              
                
              
            

            
              
                Cancelar
              
              
                Confirmar
              
            
          
        
      )}
    
  );
}