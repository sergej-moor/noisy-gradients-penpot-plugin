export class NoiseGenerator {
  // Arrays for Perlin noise permutation
  private p: number[] = new Array(512);
  private permutation: number[] = [];

  constructor() {
    this.initPermutation();
  }

  // Randomize the noise pattern
  initPermutation(): void {
    this.permutation = [...Array(256)].map(() =>
      Math.floor(Math.random() * 256)
    );
    // Double the array to avoid buffer overflow later
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i] = this.permutation[i];
    }
  }

  // Smoothstep function - makes the noise less blocky
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // Linear interpolation - basically mixing two values
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  // Generates random gradients - the core of Perlin noise
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // The main Perlin noise function - returns a value between -1 and 1
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    // Get decimal part of x and y
    x -= Math.floor(x);
    y -= Math.floor(y);

    // Fade curves for x and y
    const u = this.fade(x);
    const v = this.fade(y);

    // Hash coordinates of the 4 corners
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    // Mix it all together
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(
        u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    );
  }

  // Adds RGB noise to make it look more gritty
  private generateColorGrain(intensity: number = 0.1): ImageData {
    const canvas = document.createElement("canvas");
    const fixedSize = 400;
    canvas.width = fixedSize;
    canvas.height = fixedSize;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(fixedSize, fixedSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Random RGB values that can be either positive or negative
      const r = (Math.random() > 0.5 ? 1 : -1) * intensity * 255;
      const g = (Math.random() > 0.5 ? 1 : -1) * intensity * 255;
      const b = (Math.random() > 0.5 ? 1 : -1) * intensity * 255;

      data[i] = r; // R
      data[i + 1] = g; // G
      data[i + 2] = b; // B
      data[i + 3] = 255; // Alpha (always full opacity)
    }

    return imageData;
  }

  // Mix the grain with the base gradient
  private blendImageData(base: ImageData, overlay: ImageData): void {
    for (let i = 0; i < base.data.length; i += 4) {
      // Handle each RGB channel
      for (let j = 0; j < 3; j++) {
        const baseValue = base.data[i + j];
        const overlayValue = overlay.data[i + j];

        // Add or subtract based on noise value, with a bit more contrast
        if (overlayValue < 0) {
          base.data[i + j] = Math.max(0, baseValue + overlayValue * 1.5);
        } else {
          base.data[i + j] = Math.min(255, baseValue + overlayValue * 1.5);
        }
      }
    }
  }

  // The main function that puts everything together
  generateNoiseToCanvas(
    canvas: HTMLCanvasElement,
    settings: {
      scale: number;
      redIntensity: number;
      greenIntensity: number;
      blueIntensity: number;
      grainIntensity?: number;
    }
  ): void {
    const ctx = canvas.getContext("2d")!;
    const fixedSize = 400;
    canvas.width = fixedSize;
    canvas.height = fixedSize;

    // First create the smooth gradient
    const imageData = ctx.createImageData(fixedSize, fixedSize);
    const data = imageData.data;

    for (let y = 0; y < fixedSize; y++) {
      for (let x = 0; x < fixedSize; x++) {
        const i = (y * fixedSize + x) * 4;

        // Get noise values for each color channel
        const r = this.noise(x * settings.scale, y * settings.scale);
        const g = this.noise(
          (x + fixedSize) * settings.scale,
          y * settings.scale
        );
        const b = this.noise(
          x * settings.scale,
          (y + fixedSize) * settings.scale
        );

        // Convert noise to color (0-255) and apply intensity
        data[i] = Math.floor((r + 1) * 128 * settings.redIntensity * 1.2);
        data[i + 1] = Math.floor((g + 1) * 128 * settings.greenIntensity * 1.2);
        data[i + 2] = Math.floor((b + 1) * 128 * settings.blueIntensity * 1.2);
        data[i + 3] = 255;
      }
    }

    // Add grain if intensity is set
    if (settings.grainIntensity) {
      const grainData = this.generateColorGrain(settings.grainIntensity);
      this.blendImageData(imageData, grainData);
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
