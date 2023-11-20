'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ColorModeTabs from './components/ColorModeTabs';
import Graph from './components/Graph/Graph';
import usePaletteStore from '@/hooks/usePaletteStore';
import { ColorMode } from '@/types';

import styles from './index.module.scss';

interface PaletteProps {
  params: {
    data: string;
  };
}

export default function Palette({ params }: PaletteProps) {
  const router = useRouter();
  const [colorMode, setColorMode] = useState<ColorMode>('hue');

  // const handleClick = () => {
  //   router.replace(`${params.data}2137`);
  // };

  const pathname = usePathname();

  const setDataFromBase32 = usePaletteStore((state) => state.setDataFromBase32);

  useEffect(() => {
    const pathSegments = pathname.split('/');
    setDataFromBase32(pathSegments[pathSegments.length - 1]);
  }, [pathname, setDataFromBase32]);

  return (
    <div>
      {/* <button onClick={handleClick} type="button">
      </button> */}
      <main className={styles['main']}>
        <ColorModeTabs colorMode={colorMode} setColorMode={setColorMode} />

        <Graph colorMode={colorMode} />
      </main>
    </div>
  );
}
