export async function delay(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("wait over");
    }, duration);
  });
}
