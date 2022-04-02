// Form https://github.com/tj/co

function isGenerator(generator: any): generator is Generator {
  return 'function' === typeof generator.next && 'function' === typeof generator.throw;
}

export function isGeneratorFunction(
  generatorFunction: any
): generatorFunction is GeneratorFunction {
  if (typeof generatorFunction !== 'function') {
    return false;
  }

  const constructor = generatorFunction.constructor;

  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) {
    return true;
  }

  return isGenerator(constructor.prototype);
}
