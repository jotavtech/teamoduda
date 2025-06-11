import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './App.css';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [musicSection, setMusicSection] = useState(false);
  const [letterSection, setLetterSection] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  
  // Refs para os áudios
  const audio1 = useRef(null);
  const audio2 = useRef(null);
  const audio3 = useRef(null);

  // Função para habilitar áudio
  const enableAudio = async () => {
    try {
      // Tenta tocar e pausar cada áudio para "unlock" autoplay
      if (audio1.current) {
        await audio1.current.play();
        audio1.current.pause();
        audio1.current.currentTime = 0;
      }
      if (audio2.current) {
        await audio2.current.play();
        audio2.current.pause();
        audio2.current.currentTime = 0;
      }
      if (audio3.current) {
        await audio3.current.play();
        audio3.current.pause();
        audio3.current.currentTime = 0;
      }
      setAudioEnabled(true);
      setShowAudioPrompt(false);
      console.log('Áudio habilitado com sucesso!');
    } catch (error) {
      console.log('Erro ao habilitar áudio:', error);
      setAudioEnabled(false);
    }
  };

  // Função para parar todos os áudios imediatamente
  const stopAllAudio = () => {
    console.log('Parando todos os áudios');
    if (audio1.current) {
      audio1.current.pause();
      audio1.current.currentTime = 0;
    }
    if (audio2.current) {
      audio2.current.pause();
      audio2.current.currentTime = 0;
    }
    if (audio3.current) {
      audio3.current.pause();
      audio3.current.currentTime = 0;
    }
  };

  // Função para fade out de áudio melhorada
  const fadeOutAudio = (audioRef) => {
    if (audioRef.current && !audioRef.current.paused) {
      const audio = audioRef.current;
      const fadeAudio = setInterval(() => {
        if (audio.volume > 0.1) {
          audio.volume -= 0.2;
        } else {
          audio.volume = 0;
          audio.pause();
          audio.volume = 1; // Reset volume for next play
          clearInterval(fadeAudio);
        }
      }, 50);
    }
  };

  // Função para tocar áudio específico
  const playSpecificAudio = async (audioRef, trackId) => {
    if (!audioEnabled) {
      console.log('❌ Áudio não habilitado');
      return;
    }
    
    // Se já está tocando a mesma música, não faz nada
    if (currentTrack === trackId) {
      console.log(`✅ Já tocando: ${trackId}`);
      return;
    }
    
    console.log(`🎵 Tentando tocar: ${trackId} (atual: ${currentTrack})`);
    
    // Primeiro para todos os áudios imediatamente
    stopAllAudio();
    
    // Aguarda um pouco e então toca o áudio específico
    setTimeout(async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0;
          audioRef.current.currentTime = 0; // Reseta para o início
          
          console.log(`🎶 Iniciando reprodução: ${trackId}`);
          await audioRef.current.play();
          
          // Fade in suave
          const fadeIn = setInterval(() => {
            if (audioRef.current && audioRef.current.volume < 0.9) {
              audioRef.current.volume += 0.1;
            } else {
              if (audioRef.current) audioRef.current.volume = 1;
              clearInterval(fadeIn);
            }
          }, 100);
          
          setCurrentTrack(trackId);
          console.log(`✅ Tocando música ${trackId}`);
        } catch (error) {
          console.log('❌ Erro ao tocar áudio:', error);
        }
      } else {
        console.log('❌ Ref de áudio não encontrado');
      }
    }, 100);
  };

  // Inicializar volume dos áudios
  useEffect(() => {
    if (audio1.current) {
      audio1.current.volume = 1;
      audio1.current.addEventListener('loadeddata', () => {
        console.log('Áudio 1 carregado');
      });
      audio1.current.addEventListener('error', (e) => {
        console.log('Erro no áudio 1:', e);
      });
    }
    if (audio2.current) {
      audio2.current.volume = 1;
      audio2.current.addEventListener('loadeddata', () => {
        console.log('Áudio 2 carregado');
      });
      audio2.current.addEventListener('error', (e) => {
        console.log('Erro no áudio 2:', e);
      });
    }
    if (audio3.current) {
      audio3.current.volume = 1;
      audio3.current.addEventListener('loadeddata', () => {
        console.log('Áudio 3 carregado');
      });
      audio3.current.addEventListener('error', (e) => {
        console.log('Erro no áudio 3:', e);
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setScrollY(scrollPos);
      
      // Definir alturas das seções
      const firstSectionHeight = window.innerHeight * 4;
      const musicSectionHeight = window.innerHeight * 10; // Aumentado para 10x a altura da viewport
      const letterSectionHeight = window.innerHeight * 6; // Nova seção da carta
      
      // Calcular pontos de início de cada seção
      const musicStart = firstSectionHeight;
      const letterStart = firstSectionHeight + musicSectionHeight;
      
      // Usar tolerância maior para evitar conflitos
      const tolerance = window.innerHeight * 0.5;
      
      console.log(`📜 Scroll: ${scrollPos}, Music: ${musicStart}, Letter: ${letterStart}`);
      
      // Lógica de detecção mais simples e com maior tolerância
      let newMusicSection = false;
      let newLetterSection = false;
      
      // Seção de música: mais tolerante nas bordas
      if (scrollPos >= musicStart - tolerance && scrollPos < letterStart - tolerance) {
        newMusicSection = true;
        console.log('🎶 Entrando na seção Music');
      }
      
      // Seção da carta: apenas quando realmente entra
      if (scrollPos >= letterStart - tolerance) {
        newLetterSection = true;
        console.log('💌 Entrando na seção Letter');
      }
      
      // Atualizar estados apenas se necessário (evita re-renders desnecessários)
      if (newMusicSection !== musicSection) {
        setMusicSection(newMusicSection);
      }
      if (newLetterSection !== letterSection) {
        setLetterSection(newLetterSection);
      }
    };

    // Remover throttling que pode estar causando problemas
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [musicSection, letterSection]);

  // Calcular progresso da primeira seção
  const maxScrollFirstSection = window.innerHeight * 4;
  const firstSectionProgress = Math.min(scrollY / maxScrollFirstSection, 1);
  const writingProgress = firstSectionProgress * 100;

  // Calcular progresso da seção de música
  const musicSectionStart = window.innerHeight * 4; // Primeira seção
  const musicSectionHeight = window.innerHeight * 10; // Aumentado para 10x
  const musicProgress = musicSection ? 
    Math.max(0, Math.min((scrollY - musicSectionStart) / musicSectionHeight, 1)) : 0;

  // Calcular progresso da seção da carta
  const letterSectionStart = window.innerHeight * 4 + window.innerHeight * 10; // Após primeira e música
  const letterSectionHeight = window.innerHeight * 6;
  const letterProgress = letterSection && scrollY >= letterSectionStart ? 
    Math.max(0, Math.min((scrollY - letterSectionStart) / letterSectionHeight, 1)) : 0;

  // Posições dos discos da seção de música - movimento muito mais lento
  let disk1X = -120; // Começar ainda mais fora da tela à esquerda
  let disk2X = -120;
  let disk3X = -120;
  
  if (musicSection) {
    // Disco 1: Move da esquerda para direita apenas nos primeiros 20% do scroll (muito lento)
    if (musicProgress < 0.2) {
      disk1X = -120 + (musicProgress / 0.2) * 240; // De -120vw a +120vw muito lentamente
    } else {
      disk1X = 120; // Saiu da tela pela direita
    }
    
    // Disco 2: Move dos 30% aos 50% (movimento lento)
    if (musicProgress >= 0.3 && musicProgress < 0.5) {
      const localProgress = (musicProgress - 0.3) / 0.2;
      disk2X = -120 + localProgress * 240; // De -120vw a +120vw
    } else if (musicProgress >= 0.5) {
      disk2X = 120; // Saiu da tela pela direita
    }
    
    // Disco 3: Move dos 60% aos 80% (movimento lento)
    if (musicProgress >= 0.6 && musicProgress < 0.8) {
      const localProgress = (musicProgress - 0.6) / 0.2;
      disk3X = -120 + localProgress * 240; // De -120vw a +120vw
    } else if (musicProgress >= 0.8) {
      disk3X = 120; // Saiu da tela pela direita
    }
  }

  // Controle de áudio unificado
  useEffect(() => {
    console.log(`🎵 Audio Control Check - Enabled: ${audioEnabled}, Music: ${musicSection}, Current: ${currentTrack}`);
    
    if (!audioEnabled) {
      console.log('❌ Áudio não habilitado - saltando controle');
      return;
    }

    // Seção de música móvel
    if (musicSection && musicProgress !== undefined) {
      console.log(`🎶 Seção móvel ativa - Progresso: ${musicProgress.toFixed(2)}`);
      
      if (musicProgress < 0.25) {
        console.log('🎵 Deveria tocar mobile1');
        playSpecificAudio(audio1, 'mobile1');
      } else if (musicProgress >= 0.25 && musicProgress < 0.55) {
        console.log('🎵 Deveria tocar mobile2');
        playSpecificAudio(audio2, 'mobile2');
      } else if (musicProgress >= 0.55) {
        console.log('🎵 Deveria tocar mobile3');
        playSpecificAudio(audio3, 'mobile3');
      }
    }
    // Qualquer outra seção - para a música
    else {
      if (currentTrack !== 0) {
        console.log('🚫 Saindo das seções musicais - parando áudio');
        stopAllAudio();
        setCurrentTrack(0);
      }
    }
  }, [musicSection, musicProgress, audioEnabled, currentTrack]);

  return (
    <div className="App">
      {/* Áudios */}
      <audio ref={audio1} loop>
        <source src="https://res.cloudinary.com/dzwfuzxxw/video/upload/v1749505856/Eu_Amo_Voc%C3%AA_qBBwXuEV4jA_hmtfyk.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={audio2} loop>
        <source src="https://res.cloudinary.com/dzwfuzxxw/video/upload/v1749505852/Tribalistas_-_Velha_Inf%C3%A2ncia_ZkbuGPXJOPA_rsc1pc.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={audio3} loop>
        <source src="https://res.cloudinary.com/dzwfuzxxw/video/upload/v1749505827/Heart_To_Heart_qBoQzo98EpQ_bl0k5x.mp3" type="audio/mpeg" />
      </audio>

      {/* Prompt para habilitar áudio */}
      {showAudioPrompt && (
        <div className="audio-prompt-overlay">
          <div className="audio-prompt-content">
            <h2>🎵 Trilha Sonora Especial</h2>
            <p>Clique para habilitar as músicas que acompanham nossa história</p>
            <button onClick={enableAudio} className="enable-audio-btn">
              🎶 Habilitar Músicas 🎶
            </button>
            <button onClick={() => setShowAudioPrompt(false)} className="skip-audio-btn">
              Pular música
            </button>
          </div>
        </div>
      )}

      {/* Botão de teste de áudio (apenas para debug) */}
      {audioEnabled && !showAudioPrompt && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 10001,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => playSpecificAudio(audio1, 'test1')}
            style={{
              padding: '10px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎵 Teste 1
          </button>
          <button
            onClick={() => playSpecificAudio(audio2, 'test2')}
            style={{
              padding: '10px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎵 Teste 2
          </button>
          <button
            onClick={() => playSpecificAudio(audio3, 'test3')}
            style={{
              padding: '10px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎵 Teste 3
          </button>
        </div>
      )}

      {/* Status de áudio (debug) */}
      {!showAudioPrompt && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '10px',
          zIndex: 10001,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <div>📜 Scroll: {Math.round(scrollY)}px</div>
          <div>🎵 Áudio: {audioEnabled ? '✅ Habilitado' : '❌ Desabilitado'}</div>
          <div>🎶 Track: {currentTrack || 'Nenhum'}</div>
          <div>📱 Mobile: {musicSection ? '✅' : '❌'}</div>
          <div>🎧 Audio1: {audio1.current?.readyState === 4 ? '✅' : '❌'}</div>
          <div>🎧 Audio2: {audio2.current?.readyState === 4 ? '✅' : '❌'}</div>
          <div>🎧 Audio3: {audio3.current?.readyState === 4 ? '✅' : '❌'}</div>
        </div>
      )}

      {/* Primeira Seção - Escrita LOVERS */}
      <div className="background-image"></div>
      <div className="overlay"></div>
      
      <div className="main-section">
        <div className="writing-container">
          <svg 
            className="lovers-svg" 
            viewBox="0 0 400 100" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Letra L */}
            <path 
              d="M 20 20 L 20 70 L 50 70" 
              className="letter-path"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: Math.max(0, 80 - (writingProgress * 8))
              }}
            />
            
            {/* Letra O */}
            <circle 
              cx="70" 
              cy="45" 
              r="20" 
              className="letter-path"
              style={{
                strokeDasharray: 125,
                strokeDashoffset: Math.max(0, 125 - ((writingProgress - 12.5) * 10))
              }}
            />
            
            {/* Letra V */}
            <path 
              d="M 110 20 L 130 70 L 150 20" 
              className="letter-path"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: Math.max(0, 100 - ((writingProgress - 25) * 8))
              }}
            />
            
            {/* Letra E */}
            <path 
              d="M 170 20 L 170 70 M 170 20 L 200 20 M 170 45 L 190 45 M 170 70 L 200 70" 
              className="letter-path"
              style={{
                strokeDasharray: 120,
                strokeDashoffset: Math.max(0, 120 - ((writingProgress - 37.5) * 8))
              }}
            />
            
            {/* Letra R */}
            <path 
              d="M 220 20 L 220 70 M 220 20 L 245 20 Q 255 20 255 35 Q 255 45 245 45 L 220 45 M 245 45 L 255 70" 
              className="letter-path"
              style={{
                strokeDasharray: 140,
                strokeDashoffset: Math.max(0, 140 - ((writingProgress - 50) * 8))
              }}
            />
            
            {/* Letra S */}
            <path 
              d="M 295 30 Q 275 20 275 30 Q 275 40 285 45 Q 295 50 295 60 Q 295 70 275 60" 
              className="letter-path"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: Math.max(0, 100 - ((writingProgress - 62.5) * 8))
              }}
            />
            
            {/* Coração decorativo */}
            <path 
              d="M 320 35 Q 320 25 330 25 Q 340 25 340 35 Q 340 25 350 25 Q 360 25 360 35 Q 360 45 340 60 Q 320 45 320 35" 
              className="heart-path"
              style={{
                strokeDasharray: 120,
                strokeDashoffset: Math.max(0, 120 - ((writingProgress - 75) * 8)),
                fill: firstSectionProgress > 0.9 ? '#ff6b6b' : 'none'
              }}
            />
          </svg>
        </div>

        {!musicSection && (
          <>
        <div className="scroll-indicator">
          <p>Role para baixo para escrever "LOVERS" ❤️</p>
          <div className="arrow-down">⬇️</div>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${writingProgress}%` }}
            ></div>
          </div>
          <p>{Math.round(writingProgress)}% escrito</p>
        </div>
          </>
        )}
      </div>

      {/* Segunda Seção - Discos de Música */}
      {musicSection && (
        <div className="music-section">
          <div className="music-background"></div>
          
          {/* Disco 1 - Tim Maia */}
          <motion.div 
            className="vinyl-container"
            style={{ 
              x: `${disk1X}vw`,
              opacity: musicProgress < 0.25 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 50, damping: 25 }}
          >
            <div className="vinyl-disk">
              <div className="vinyl-label">
                <h3>Tim Maia</h3>
                <p>Eu Amo Você</p>
              </div>
              <div className="vinyl-grooves"></div>
            </div>
          </motion.div>

          {/* Disco 2 - Tribalistas */}
          <motion.div 
            className="vinyl-container"
            style={{ 
              x: `${disk2X}vw`,
              opacity: musicProgress >= 0.25 && musicProgress < 0.55 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 50, damping: 25 }}
          >
            <div className="vinyl-disk tribalistas">
              <div className="vinyl-label">
                <h3>Tribalistas</h3>
                <p>Velha Infância</p>
              </div>
              <div className="vinyl-grooves"></div>
            </div>
          </motion.div>

          {/* Disco 3 - Mac DeMarco */}
          <motion.div 
            className="vinyl-container"
            style={{ 
              x: `${disk3X}vw`,
              opacity: musicProgress >= 0.55 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 50, damping: 25 }}
          >
            <div className="vinyl-disk mac-demarco">
              <div className="vinyl-label">
                <h3>Mac DeMarco</h3>
                <p>Heart to Heart</p>
              </div>
              <div className="vinyl-grooves"></div>
            </div>
          </motion.div>

          {/* Indicador de música */}
          <div className="music-indicator">
            <p>🎵 Tocando: {
              currentTrack === 'mobile1' ? 'Tim Maia - Eu Amo Você' :
              currentTrack === 'mobile2' ? 'Tribalistas - Velha Infância' :
              currentTrack === 'mobile3' ? 'Mac DeMarco - Heart to Heart' : 
              'Preparando música...'
            }</p>
          </div>
          
          <div className="music-scroll-indicator">
            <p>Continue rolando para trocar de música 🎶</p>
          </div>
        </div>
      )}

      {/* Terceira Seção - Carta de Amor */}
      {letterSection && (
        <div className="letter-section">
          <div className="letter-background"></div>
          
          {/* Corações flutuantes */}
          <div className="floating-hearts">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="floating-heart"
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: letterProgress > 0.1 ? 1 : 0,
                  y: letterProgress > 0.1 ? -20 : 100,
                  x: Math.sin(Date.now() * 0.001 + i) * 50
                }}
                transition={{ 
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{
                  left: `${10 + i * 7}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              >
                💕
              </motion.div>
            ))}
          </div>

          {/* Envelope */}
          <motion.div 
            className="envelope-container"
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ 
              scale: letterProgress > 0 ? 1 : 0.7,
              opacity: letterProgress > 0 ? 1 : 0,
              y: letterProgress > 0 ? 0 : 50
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Envelope de fundo */}
            <div className="envelope-back"></div>
            
            {/* Tampa do envelope - animação em estágios */}
            <motion.div 
              className="envelope-flap"
              style={{
                rotateX: letterProgress > 0.1 ? letterProgress * 180 : 0 // Tampa abre após 10% do scroll
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            ></motion.div>
            
            {/* Carta saindo do envelope - animação em estágios */}
            <motion.div 
              className="letter-paper"
              initial={{ y: 0, scale: 0.95, opacity: 0.8 }}
              animate={{
                y: letterProgress > 0.2 ? -80 : 0, // Carta começa a sair após 20% do scroll
                scale: letterProgress > 0.3 ? 1 : 0.95, // Carta cresce após 30% do scroll
                opacity: letterProgress > 0.15 ? 1 : 0.8, // Carta fica visível após 15% do scroll
                rotateX: letterProgress > 0.25 ? 0 : -5 // Carta se alinha após 25% do scroll
              }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              {/* Cabeçalho da carta */}
              <div className="letter-header">
                <h2>💌 Para Minha Querida Maria Eduarda 💌</h2>
                <div className="letter-date">
                  <p>12 de junho de 2024</p>
                  <p>Com todo meu amor ❤️</p>
                </div>
              </div>

              {/* Conteúdo da carta */}
              <motion.div 
                className="letter-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: letterProgress > 0.4 ? 1 : 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <p className="letter-paragraph">
                  <span className="first-letter">M</span>aria Eduarda, meu amor,
                </p>
                
                <p className="letter-paragraph">
                  Cada dia ao seu lado é como descobrir um novo verso de uma poesia que nunca termina — 
                  e que, mesmo lendo mil vezes, continua me tocando como se fosse a primeira.
                </p>
                
                <p className="letter-paragraph">
                  Você é a melodia que embala meus sonhos, a calmaria no meu caos, a luz que invade até 
                  os dias mais nublados da minha alma. Nos seus olhos, eu vejo o infinito; no seu sorriso, 
                  o sentido de todos os meus amanhãs.
                </p>
                
                <p className="letter-paragraph">
                  Não tem como falar da nossa história sem lembrar daquele dia especial na Tok&Stok — 
                  nosso pedido de namoro. Em meio a móveis e decoração, construímos o primeiro tijolo da 
                  nossa própria casa de sentimentos. E eu repetiria cada detalhe daquele momento. Repetiria 
                  o nervosismo, o brilho nos seus olhos, o abraço que encaixou como lar. Repetiria tudo, 
                  infinitas vezes.
                </p>
                
                <p className="letter-paragraph">
                  Porque a verdade é que a cada minuto ao seu lado, eu só tenho mais certeza de que quero 
                  mais. Mais momentos com você, mais risos, mais planos bobos e profundos, mais silêncio 
                  que fala, mais domingos tranquilos e noites que parecem curtas demais.
                </p>
                
                <p className="letter-paragraph">
                  Você não é só minha namorada. É minha melhor amiga, minha confidente, minha inspiração 
                  e meu lugar favorito no mundo.
                </p>
                
                <p className="letter-paragraph">
                  Prometo te amar nos dias leves e nos pesados, nos sonhos e nas tempestades. Prometo ser 
                  abrigo quando o mundo parecer demais e coragem quando a vida pedir passos ousados.
                </p>
                
                <p className="letter-paragraph">
                  Obrigado por me deixar te amar. Obrigado por ser essa mulher maravilhosa, única, 
                  insubstituível, perfeita aos meus olhos.
                </p>
                
                <div className="letter-signature">
                  <p>Te amo mais do que qualquer palavra poderia traduzir.</p>
                  <p className="signature-name">Seu amor eterno ❤️</p>
                  <div className="signature-hearts">💕 💖 💕</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Indicador de progresso da carta */}
          <div className="letter-progress-indicator">
            <p>Role para abrir a carta de amor 💌</p>
            <div className="letter-progress-bar">
              <div 
                className="letter-progress-fill"
                style={{ width: `${letterProgress * 100}%` }}
              ></div>
            </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default App; 