import { IReaction } from './observer';

export type Effects = Set<IReaction>;

export type Dependencies = Map<string | symbol, Effects>;

// target - 1:n > key - n:n > effects
export const targetToDependenciesMap = new WeakMap<object, Dependencies>();

const reactionStack: IReaction[] = [];

export function effect(reaction: IReaction, observeFunction: IReaction, context: any, args: any[]) {
  if (reaction.unobserved) {
    return Reflect.apply(observeFunction, context, args);
  }

  try {
    cleanup(reaction);
    reactionStack.push(reaction);
    return Reflect.apply(observeFunction, context, args);
  } finally {
    reactionStack.pop();
  }
}

export function cleanup(reaction: IReaction) {
  reaction.cleaners?.forEach((effects) => effects.delete(reaction));
  reaction.cleaners = [];
}

export function getReaction() {
  return reactionStack[reactionStack.length - 1];
}

export function hasReaction() {
  return reactionStack.length > 0;
}

// Collection dependency.
export function track(target: object, key: string | symbol) {
  if (!hasReaction()) {
    return;
  }

  let dependencies = targetToDependenciesMap.get(target);
  if (!dependencies) {
    dependencies = new Map();
    targetToDependenciesMap.set(target, dependencies);
  }
  let effects = dependencies.get(key);
  if (!effects) {
    effects = new Set();
    dependencies.set(key, effects);
  }
  const reaction = getReaction();
  effects.add(reaction);
  reaction.cleaners?.push(effects);
}

export function trigger(target: object, key: string | symbol) {
  targetToDependenciesMap
    .get(target)
    ?.get(key)
    ?.forEach((reaction) => reaction());
}
