const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Libre+Franklin:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    button { border: none; cursor: pointer; font-family: 'Libre Franklin', sans-serif; }
    textarea, input { font-family: 'Libre Franklin', sans-serif; }
    ::-webkit-scrollbar { width: 0; height: 0; }
    .press { transition: transform 0.12s ease, opacity 0.12s ease; }
    .press:active { transform: scale(0.96); opacity: 0.82; }
    .fade-in { animation: fadeIn 0.18s ease; }
    .slide-up { animation: slideUp 0.28s cubic-bezier(0.32,0.72,0,1); }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  `}</style>
);

export default Styles;
