import { BaseView } from '../BaseView';
import { Column } from '../Column';
import { Row } from '../Row';

const COLORS = ['#8473C6', '#DBBB9A', '#84BED4', '#6F99D2', '#9EDB90'] as const;
const RANDOM_BASE = Math.pow(2, 32) - 1;

class Random {
  private randomseed: number;

  constructor(seed: number) {
    this.randomseed = seed;
  }

  random() {
    const next = (1103515245 * this.randomseed + 123456789) % RANDOM_BASE;
    this.randomseed = next;
    return next / RANDOM_BASE;
  }

  randomInt(min: number, max: number) {
    return Math.floor(min + this.random() * (max - min));
  }
}

function getSeed(address?: string) {
  let seed = 0;

  for (let i = 0; address && i < address.length; i++) {
    seed += Math.pow(address.charCodeAt(i), 3) + 1;
  }

  return seed;
}

function getHeadPicture(address?: string) {
  const random = new Random(getSeed(address));
  const data = Array.from({ length: 5 }, () => {
    const row = [
      Math.floor(random.random() * 2),
      Math.floor(random.random() * 2),
      Math.floor(random.random() * 2)
    ];

    row.push(row[1], row[0]);
    return row;
  });

  return {
    data,
    color: COLORS[random.randomInt(0, COLORS.length)]
  };
}

export function HeadPicture({
  address,
  size = 30,
  padding = 5,
  gap = 1,
  borderRadius = '50%'
}: {
  address?: string;
  size?: number;
  padding?: number;
  gap?: number;
  borderRadius?: number | string;
}) {
  const { data, color } = getHeadPicture(address);

  return (
    <Column
      justifyCenter
      itemsCenter
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        backgroundColor: '#373025',
        padding,
        gap,
        flexShrink: 0,
        borderRadius,
        boxSizing: 'border-box'
      }}>
      {data.map((row, rowIndex) => (
        <Row key={rowIndex} style={{ flex: 1, width: '100%', gap }}>
          {row.map((cell, cellIndex) => (
            <BaseView
              key={`${rowIndex}-${cellIndex}`}
              style={{
                flex: 1,
                height: '100%',
                backgroundColor: cell ? color : 'transparent'
              }}
            />
          ))}
        </Row>
      ))}
    </Column>
  );
}
