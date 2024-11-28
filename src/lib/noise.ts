export class NoiseGenerator {
  private p: number[] = new Array(512);
  private permutation: number[] = [];

  constructor() {
    this.initPermutation();
  }

  initPermutation(): void {
    this.permutation = [...Array(256)].map(() =>
      Math.floor(Math.random() * 256)
    );
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i] = this.permutation[i];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

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

  private generateColorGrain(intensity: number = 0.1): ImageData {
    const canvas = document.createElement("canvas");
    const fixedSize = 400;
    canvas.width = fixedSize;
    canvas.height = fixedSize;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(fixedSize, fixedSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Generate independent RGB noise values
      const r = (Math.random() > 0.5 ? 1 : -1) * intensity * 255;
      const g = (Math.random() > 0.5 ? 1 : -1) * intensity * 255;
      const b = (Math.random() > 0.5 ? 1 : -1) * intensity * 255;

      data[i] = r; // Red channel
      data[i + 1] = g; // Green channel
      data[i + 2] = b; // Blue channel
      data[i + 3] = 255;
    }

    return imageData;
  }

  private blendImageData(base: ImageData, overlay: ImageData): void {
    for (let i = 0; i < base.data.length; i += 4) {
      // Apply RGB noise independently for each channel
      for (let j = 0; j < 3; j++) {
        const baseValue = base.data[i + j];
        const overlayValue = overlay.data[i + j];

        // Enhanced contrast blending
        if (overlayValue < 0) {
          base.data[i + j] = Math.max(0, baseValue + overlayValue * 1.5);
        } else {
          base.data[i + j] = Math.min(255, baseValue + overlayValue * 1.5);
        }
      }
    }
  }

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

    // Generate base gradient with enhanced contrast
    const imageData = ctx.createImageData(fixedSize, fixedSize);
    const data = imageData.data;

    for (let y = 0; y < fixedSize; y++) {
      for (let x = 0; x < fixedSize; x++) {
        const i = (y * fixedSize + x) * 4;

        // Generate more vibrant base colors
        const r = this.noise(x * settings.scale, y * settings.scale);
        const g = this.noise(
          (x + fixedSize) * settings.scale,
          y * settings.scale
        );
        const b = this.noise(
          x * settings.scale,
          (y + fixedSize) * settings.scale
        );

        // Enhanced color mapping for more vibrancy
        data[i] = Math.floor((r + 1) * 128 * settings.redIntensity * 1.2);
        data[i + 1] = Math.floor((g + 1) * 128 * settings.greenIntensity * 1.2);
        data[i + 2] = Math.floor((b + 1) * 128 * settings.blueIntensity * 1.2);
        data[i + 3] = 255;
      }
    }

    // Add colored grain
    if (settings.grainIntensity) {
      const grainData = this.generateColorGrain(settings.grainIntensity);
      this.blendImageData(imageData, grainData);
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
