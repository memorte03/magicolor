import { useShallow } from 'zustand/react/shallow';

import { COLOR_MODES } from '@/constants';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode } from '@/types';

import styles from './index.module.scss';

interface ColorModeTabButtonProps {
  colorMode: ColorMode;
  active: boolean;
  setColorMode: (ColorMode: ColorMode) => void;
}

const ColorModeTabButton = ({
  colorMode,
  active,
  setColorMode,
}: ColorModeTabButtonProps) => {
  const handleSetColorMode = () => {
    setColorMode(colorMode);
  };
  return (
    <button
      className={[
        styles['button'],
        active ? styles['button--active'] : '',
      ].join(' ')}
      onClick={handleSetColorMode}
      role="tab"
      type="button"
    >
      {colorMode[0].toUpperCase() + colorMode.slice(1, colorMode.length)}
    </button>
  );
};

export default function ColorModeTabs() {
  const [colorMode, setColorMode] = usePaletteStore(
    useShallow((state) => [state.colorMode, state.setColorMode]),
  );
  return (
    <div className={styles['container']}>
      {COLOR_MODES.map((mode) => (
        <ColorModeTabButton
          active={colorMode === mode}
          colorMode={mode}
          key={`tab-button-${mode}`}
          setColorMode={setColorMode}
        />
      ))}
    </div>
  );
}
