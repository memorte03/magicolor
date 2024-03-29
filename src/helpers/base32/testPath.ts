export function testBase32Path(base32: string): boolean {
  const regex =
    /^h-[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2}(?:-[A-Z2-7]{6}[0-1]{1}[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2})*-[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2}-s-[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2}(?:-[A-Z2-7]{6}[0-1]{1}[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2})*-[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2}-l-[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2}(?:-[A-Z2-7]{6}[0-1]{1}[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2})*-[A-Z2-7]{4}[0-1]{1}[A-Z2-7]{2}-p(?:-[A-Z2-7]{2})*$/;

  return regex.test(base32);
}
