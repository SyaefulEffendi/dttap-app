import { useState, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import './index.css';

// Halaman / screen yang tersedia
const SCREENS = {
  HOME: 'home',
  MENU: 'menu',
  GAME: 'game',
  RESULT: 'result',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  const goHome = useCallback(() => {
    setScreen(SCREENS.HOME);
    setSelectedCategory(null);
    setFinalScore(null);
  }, []);

  const goMenu = useCallback(() => {
    setScreen(SCREENS.MENU);
    setFinalScore(null);
  }, []);

  const handleSelectCategory = useCallback((category) => {
    setSelectedCategory(category);
    setScreen(SCREENS.GAME);
  }, []);

  const handleGameFinish = useCallback((score) => {
    setFinalScore(score);
    setScreen(SCREENS.RESULT);
  }, []);

  const handleReplay = useCallback(() => {
    if (selectedCategory) {
      setFinalScore(null);
      setScreen(SCREENS.GAME);
    }
  }, [selectedCategory]);

  return (
    <div className="full">
      {screen === SCREENS.HOME && (
        <HomeScreen onStart={goMenu} />
      )}

      {screen === SCREENS.MENU && (
        <MenuScreen
          onSelectCategory={handleSelectCategory}
          onBack={goHome}
        />
      )}

      {screen === SCREENS.GAME && selectedCategory && (
        <GameScreen
          key={`${selectedCategory.id}-${Date.now()}`}
          category={selectedCategory}
          onFinish={handleGameFinish}
          onBack={goMenu}
        />
      )}

      {screen === SCREENS.RESULT && finalScore && selectedCategory && (
        <ResultScreen
          score={finalScore}
          category={selectedCategory}
          onBackToMenu={goMenu}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}
