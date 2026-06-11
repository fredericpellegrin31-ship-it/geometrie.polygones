import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, RotateCcw, Play, CheckCircle, XCircle } from 'lucide-react';

// --- DEFINITION DES 30 FORMES (15 Polygones, 15 Non-Polygones) ---
const SHAPES_DB = [
  // Polygones (Fermés, uniquement des lignes droites)
  { id: 1, isPolygon: true, name: 'Triangle', svg: <polygon points="50,10 90,90 10,90" fill="currentColor"/> },
  { id: 2, isPolygon: true, name: 'Carré', svg: <rect x="20" y="20" width="60" height="60" fill="currentColor"/> },
  { id: 3, isPolygon: true, name: 'Rectangle', svg: <rect x="15" y="30" width="70" height="40" fill="currentColor"/> },
  { id: 4, isPolygon: true, name: 'Pentagone', svg: <polygon points="50,10 90,40 75,90 25,90 10,40" fill="currentColor"/> },
  { id: 5, isPolygon: true, name: 'Hexagone', svg: <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="currentColor"/> },
  { id: 6, isPolygon: true, name: 'Octogone', svg: <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="currentColor"/> },
  { id: 7, isPolygon: true, name: 'Étoile', svg: <polygon points="50,5 64,35 98,35 70,55 80,90 50,70 20,90 30,55 2,35 36,35" fill="currentColor"/> },
  { id: 8, isPolygon: true, name: 'Losange', svg: <polygon points="50,10 90,50 50,90 10,50" fill="currentColor"/> },
  { id: 9, isPolygon: true, name: 'Trapèze', svg: <polygon points="30,20 70,20 90,80 10,80" fill="currentColor"/> },
  { id: 10, isPolygon: true, name: 'Parallélogramme', svg: <polygon points="30,20 90,20 70,80 10,80" fill="currentColor"/> },
  { id: 11, isPolygon: true, name: 'Triangle Rectangle', svg: <polygon points="20,10 20,90 90,90" fill="currentColor"/> },
  { id: 12, isPolygon: true, name: 'Croix', svg: <polygon points="35,10 65,10 65,35 90,35 90,65 65,65 65,90 35,90 35,65 10,65 10,35 35,35" fill="currentColor"/> },
  { id: 13, isPolygon: true, name: 'Flèche', svg: <polygon points="10,30 50,70 90,30 90,50 50,90 10,50" fill="currentColor"/> },
  { id: 14, isPolygon: true, name: 'Irrégulier 1', svg: <polygon points="20,20 80,10 90,60 40,90 10,70" fill="currentColor"/> },
  { id: 15, isPolygon: true, name: 'Cerf-volant', svg: <polygon points="50,10 80,40 50,95 20,40" fill="currentColor"/> },

  // Non-Polygones (Courbes, ou formes ouvertes)
  { id: 16, isPolygon: false, name: 'Cercle', svg: <circle cx="50" cy="50" r="40" fill="currentColor"/> },
  { id: 17, isPolygon: false, name: 'Ovale', svg: <ellipse cx="50" cy="50" rx="45" ry="25" fill="currentColor"/> },
  { id: 18, isPolygon: false, name: 'Demi-cercle', svg: <path d="M10,50 A40,40 0 0,1 90,50 Z" fill="currentColor"/> },
  { id: 19, isPolygon: false, name: 'Croissant', svg: <path d="M50,10 A40,40 0 1,1 10,50 A30,30 0 1,0 50,10 Z" fill="currentColor"/> },
  { id: 20, isPolygon: false, name: 'Cœur', svg: <path d="M50,35 A20,20 0 0,1 90,35 C90,60 50,90 50,90 C50,90 10,60 10,35 A20,20 0 0,1 50,35 Z" fill="currentColor"/> },
  { id: 21, isPolygon: false, name: 'Goutte', svg: <path d="M50,10 C90,50 90,90 50,90 C10,90 10,50 50,10 Z" fill="currentColor"/> },
  { id: 22, isPolygon: false, name: 'Pacman', svg: <path d="M50,50 L90,20 A40,40 0 1,1 90,80 Z" fill="currentColor"/> },
  { id: 23, isPolygon: false, name: 'Nuage', svg: <path d="M30,50 A20,20 0 0,1 50,30 A25,25 0 0,1 80,45 A20,20 0 0,1 75,80 L25,80 A15,15 0 0,1 30,50 Z" fill="currentColor"/> },
  { id: 24, isPolygon: false, name: 'Tache', svg: <path d="M40,10 C70,0 95,30 80,65 C70,95 30,95 10,65 C-10,35 10,20 40,10 Z" fill="currentColor"/> },
  { id: 25, isPolygon: false, name: 'Dôme', svg: <path d="M15,80 L85,80 L85,50 A35,35 0 0,0 15,50 Z" fill="currentColor"/> },
  // Formes ouvertes (Lignes) -> Non polygones
  { id: 26, isPolygon: false, name: 'Angle Ouvert', svg: <polyline points="20,20 50,80 80,20" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/> },
  { id: 27, isPolygon: false, name: 'Boîte Ouverte', svg: <polyline points="20,20 20,80 80,80 80,20" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/> },
  { id: 28, isPolygon: false, name: 'Croix Ouverte', svg: <g stroke="currentColor" strokeWidth="12" strokeLinecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="80" y1="20" x2="20" y2="80"/></g> },
  { id: 29, isPolygon: false, name: 'Spirale', svg: <path d="M50,50 m0,-10 a10,10 0 1,1 -10,10 a20,20 0 1,0 20,-20 a30,30 0 1,1 -30,30" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/> },
  { id: 30, isPolygon: false, name: 'Vague', svg: <path d="M10,50 Q30,20 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/> }
];

const COLORS = ['text-blue-500', 'text-pink-500', 'text-yellow-500', 'text-purple-500', 'text-cyan-500', 'text-indigo-500'];

// Fonction utilitaire pour mélanger un tableau
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

// --- COMPOSANT CONFETTIS AMÉLIORÉ ---
const ConfettiOverlay = ({ active, continuous }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Si inactif, on efface complètement le canevas pour éviter les confettis figés
    if (!active && !continuous) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId;
    let particles = [];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Palette de couleurs vive, lumineuse et festive
    const colors = [
      '#FF2A7A', '#FF7A00', '#FFD600', '#00E676', 
      '#00B0FF', '#7C4DFF', '#E040FB', '#00E5FF', 
      '#FF5252', '#69F0AE'
    ];

    const createParticles = (count, spreadVertically) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          // Répartition aléatoire sur toute la largeur
          x: Math.random() * canvas.width,
          // Si spreadVertically est vrai (au début d'un succès), on les étale au-dessus de l'écran pour un effet de pluie continue
          y: spreadVertically ? (Math.random() * -canvas.height * 0.8) - 10 : (Math.random() * -40) - 10,
          r: Math.random() * 3 + 2, // Taille plus petite (entre 2px et 5px)
          dx: Math.random() * 3 - 1.5, // Léger mouvement latéral (dérive)
          dy: Math.random() * 4 + 3, // Vitesse de descente verticale soutenue (toujours vers le bas)
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.floor(Math.random() * 6) - 3,
          tiltAngle: Math.random() * Math.PI,
          tiltAngleInc: (Math.random() * 0.08) + 0.04
        });
      }
    };

    // On génère beaucoup de petites particules d'un coup (pluie de confettis)
    if (active && !continuous) {
      createParticles(120, true);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // En mode continu (écran de fin parfait), on réalimente le flux régulièrement
      if (continuous && Math.random() < 0.4) {
        createParticles(8, false);
      }

      particles.forEach((p, index) => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += p.dy; // Descente constante vers le bas
        p.x += p.dx + Math.sin(p.tiltAngle) * 0.8; // Oscillation fluide
        
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();

        // Nettoyage des particules hors écran
        if (p.y > canvas.height) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0 || continuous) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, continuous]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

export default function App() {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'end'
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFirstTry, setIsFirstTry] = useState(true);
  const [currentColor, setCurrentColor] = useState('');
  
  // Animation states
  const [shapeStatus, setShapeStatus] = useState('idle'); // 'idle', 'success', 'error'
  const [showConfetti, setShowConfetti] = useState(false);

  // Drag and drop references
  const shapeRef = useRef(null);
  const dragData = useRef({ isDragging: false, startX: 0, startY: 0, posX: 0, posY: 0 });

  // Initialisation du jeu
  const startGame = () => {
    const shuffled = shuffle(SHAPES_DB);
    // On s'assure d'avoir un mix (ex: au moins 3 de chaque)
    const poly = shuffled.filter(s => s.isPolygon).slice(0, 5);
    const nonPoly = shuffled.filter(s => !s.isPolygon).slice(0, 5);
    
    setSelectedShapes(shuffle([...poly, ...nonPoly]));
    setCurrentIndex(0);
    setScore(0);
    setIsFirstTry(true);
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setGameState('playing');
    setShapeStatus('idle');
  };

  // Gestion du Drag & Drop personnalisé (très fluide sur tablette et PC)
  const onPointerDown = (e) => {
    if (shapeStatus !== 'idle') return; // Bloquer si animation en cours
    dragData.current.isDragging = true;
    dragData.current.startX = e.clientX - dragData.current.posX;
    dragData.current.startY = e.clientY - dragData.current.posY;
    e.target.setPointerCapture(e.pointerId);
    shapeRef.current.style.transition = 'none';
  };

  const onPointerMove = (e) => {
    if (!dragData.current.isDragging) return;
    dragData.current.posX = e.clientX - dragData.current.startX;
    dragData.current.posY = e.clientY - dragData.current.startY;
    shapeRef.current.style.transform = `translate(${dragData.current.posX}px, ${dragData.current.posY}px) scale(1.1)`;
  };

  const onPointerUp = (e) => {
    if (!dragData.current.isDragging) return;
    dragData.current.isDragging = false;
    e.target.releasePointerCapture(e.pointerId);
    
    shapeRef.current.style.transition = 'transform 0.3s ease-out';
    checkDropZone(e.clientX);
  };

  const resetShapePosition = () => {
    dragData.current.posX = 0;
    dragData.current.posY = 0;
    if (shapeRef.current) {
      shapeRef.current.style.transform = `translate(0px, 0px) scale(1)`;
    }
  };

  // Vérification de la zone de dépôt
  const checkDropZone = (clientX) => {
    const screenWidth = window.innerWidth;
    const currentShape = selectedShapes[currentIndex];
    
    // Zone gauche (< 50%) = Polygone, Zone droite (> 50%) = Non polygone
    // On exige d'être un peu enfoncé dans la zone (marge de 10%)
    let droppedZone = null;
    if (clientX < screenWidth * 0.4) droppedZone = 'polygon';
    else if (clientX > screenWidth * 0.6) droppedZone = 'non-polygon';

    if (!droppedZone) {
      // Relâché au milieu, on remet à la place initiale
      resetShapePosition();
      return;
    }

    const isCorrect = (droppedZone === 'polygon' && currentShape.isPolygon) || 
                      (droppedZone === 'non-polygon' && !currentShape.isPolygon);

    if (isCorrect) {
      handleSuccess();
    } else {
      handleError();
    }
  };

  const handleSuccess = () => {
    setShapeStatus('success');
    setShowConfetti(true);
    
    if (isFirstTry) {
      setScore(prev => prev + 1);
    }

    // Le délai est augmenté à 3,2 secondes pour permettre aux confettis
    // de finir leur chute agréable avant d'afficher la forme suivante.
    setTimeout(() => {
      setShowConfetti(false);
      if (currentIndex + 1 < 10) {
        setCurrentIndex(prev => prev + 1);
        setIsFirstTry(true);
        setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setShapeStatus('idle');
        resetShapePosition();
      } else {
        setGameState('end');
      }
    }, 3200);
  };

  const handleError = () => {
    setShapeStatus('error');
    setIsFirstTry(false);
    
    setTimeout(() => {
      setShapeStatus('idle');
      resetShapePosition();
    }, 600); // Temps de l'animation shake + retour
  };

  // --- RENDUS DES DIFFERENTS ECRANS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 text-center bg-white rounded-3xl shadow-xl max-w-2xl mx-auto border-4 border-indigo-100">
      <div className="bg-indigo-100 p-6 rounded-full">
        <Trophy size={64} className="text-indigo-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800">
        Le Défi des Polygones !
      </h1>
      <p className="text-xl md:text-2xl text-gray-600">
        Glisse les formes dans la bonne colonne.<br/>
        Est-ce un <strong>polygone</strong> (fermé, lignes droites) ou non ?
      </p>
      <button 
        onClick={startGame}
        className="flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-2xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
      >
        <Play size={28} /> Jouer !
      </button>
    </div>
  );

  const renderEndScreen = () => {
    let coupes = 0;
    let title = "";
    let message = "";
    let isPerfect = false;

    if (score <= 4) {
      coupes = 1; // 1 coupe d'encouragement
      title = "Bien essayé !";
      message = "Continue de t'entraîner pour reconnaître les polygones.";
    } else if (score >= 5 && score <= 7) {
      coupes = 2;
      title = "Bravo !";
      message = "Tu te débrouilles bien avec les polygones.";
    } else if (score >= 8 && score <= 9) {
      coupes = 3;
      title = "Excellent !";
      message = "Tu es un(e) as de la géométrie !";
    } else if (score === 10) {
      coupes = 3;
      isPerfect = true;
      title = "PARFAIT !";
      message = "Sans aucune faute ! Tu es le Maître des Polygones !";
    }

    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-8 text-center bg-white rounded-3xl shadow-xl max-w-2xl mx-auto border-4 border-yellow-200 relative overflow-hidden">
        {isPerfect && <ConfettiOverlay active={true} continuous={true} />}
        
        <h2 className="text-5xl font-extrabold text-indigo-800 z-10">{title}</h2>
        <p className="text-2xl text-gray-600 z-10">Ton score final : <span className="font-bold text-indigo-600 text-3xl">{score} / 10</span></p>
        
        <div className="flex gap-4 my-6 z-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`transform transition-all duration-500 ${i < coupes ? 'scale-110 opacity-100' : 'scale-75 opacity-20 grayscale'}`}>
              <Trophy size={80} className={`${i < coupes ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-400'}`} fill={i < coupes ? "#FBBF24" : "none"} />
            </div>
          ))}
        </div>
        
        <p className="text-xl font-medium text-gray-700 z-10">{message}</p>
        
        <button 
          onClick={startGame}
          className="mt-8 flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg z-10"
        >
          <RotateCcw size={24} /> Rejouer
        </button>
      </div>
    );
  };

  const renderGame = () => {
    const currentShape = selectedShapes[currentIndex];

    return (
      <div className="flex flex-col h-full w-full">
        {/* HEADER : Score & Progression */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-md mb-4 shrink-0">
          <div className="text-xl font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
            Forme <span className="text-indigo-600">{currentIndex + 1}</span> / 10
          </div>
          <div className="text-xl font-bold text-gray-600 bg-yellow-100 px-4 py-2 rounded-full flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            Score: <span className="text-yellow-600">{score}</span>
          </div>
        </div>

        {/* AIRE DE JEU */}
        <div className="flex-1 relative flex overflow-hidden rounded-3xl shadow-inner border-2 border-gray-100 bg-white">
          
          {/* Colonne Gauche : Polygones */}
          <div className="w-1/2 flex flex-col items-center justify-center p-4 border-r-4 border-dashed border-green-200 bg-green-50/50">
            <div className="text-center mb-auto pt-8">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
              <h2 className="text-2xl md:text-3xl font-extrabold text-green-700">Polygones</h2>
              <p className="text-sm md:text-base font-medium text-green-600 mt-2 hidden md:block">(Lignes droites et fermé)</p>
            </div>
          </div>

          {/* Colonne Droite : Non-Polygones */}
          <div className="w-1/2 flex flex-col items-center justify-center p-4 bg-orange-50/50 border-l-4 border-dashed border-orange-200">
             <div className="text-center mb-auto pt-8">
              <XCircle className="mx-auto text-orange-500 mb-2" size={48} />
              <h2 className="text-2xl md:text-3xl font-extrabold text-orange-700">Non Polygones</h2>
              <p className="text-sm md:text-base font-medium text-orange-600 mt-2 hidden md:block">(Arrondis ou ouvert)</p>
            </div>
          </div>

          {/* LA FORME À GLISSER */}
          {currentShape && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                ref={shapeRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className={`
                  pointer-events-auto touch-none cursor-grab active:cursor-grabbing p-6 rounded-3xl
                  flex items-center justify-center w-40 h-40 md:w-48 md:h-48
                  transition-colors duration-300
                  ${shapeStatus === 'idle' ? 'bg-white shadow-xl hover:shadow-2xl hover:scale-105 border-4 border-gray-100' : ''}
                  ${shapeStatus === 'error' ? 'bg-red-500 border-red-600 animate-shake shadow-red-500/50' : ''}
                  ${shapeStatus === 'success' ? 'scale-0 opacity-0 bg-green-400' : ''}
                `}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <svg 
                  viewBox="0 0 100 100" 
                  className={`w-full h-full ${shapeStatus === 'error' ? 'text-white' : currentColor}`}
                >
                  {currentShape.svg}
                </svg>
              </div>
            </div>
          )}

          {/* Instructions en bas */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <span className="bg-white/80 backdrop-blur-sm text-gray-600 font-bold px-6 py-3 rounded-full shadow-sm text-lg border border-gray-200">
              Glisse la forme à gauche ou à droite !
            </span>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans flex flex-col selection:bg-none">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(1.1); }
          20% { transform: translateX(-15px) rotate(-10deg) scale(1.1); }
          40% { transform: translateX(15px) rotate(10deg) scale(1.1); }
          60% { transform: translateX(-15px) rotate(-10deg) scale(1.1); }
          80% { transform: translateX(15px) rotate(10deg) scale(1.1); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}} />
      
      <ConfettiOverlay active={showConfetti} continuous={false} />

      <div className="max-w-5xl mx-auto w-full h-[85vh] md:h-[90vh]">
        {gameState === 'start' && renderStartScreen()}
        {gameState === 'playing' && renderGame()}
        {gameState === 'end' && renderEndScreen()}
      </div>
    </div>
  );
}