import { describe, expect, it } from 'vitest';
import { impactInputSchema, locationSchema, scenarioSchema, urlStateSchema } from '../schemas';

const validInput = {
  diameter: 20,
  density: 3300,
  velocity: 19,
  angle: 18,
  location: { lat: 37.5665, lng: 126.978, label: 'Seoul' },
  targetDensity: 3000,
} satisfies Record<string, unknown>;

describe('domain schemas', () => {
  it('accepts minimum boundary values for impact input', () => {
    // given
    const input = {
      diameter: 1,
      density: 1000,
      velocity: 11,
      angle: 1,
      location: { lat: -90, lng: -180 },
      targetDensity: 1000,
    };

    // when
    const parsedInput = impactInputSchema.parse(input);

    // then
    expect(parsedInput.diameter).toBe(1);
    expect(parsedInput.density).toBe(1000);
    expect(parsedInput.velocity).toBe(11_000);
    expect(parsedInput.angle).toBe(1);
    expect(parsedInput.location.lat).toBe(-90);
    expect(parsedInput.location.lng).toBe(-180);
  });

  it('accepts maximum boundary values for impact input', () => {
    // given
    const input = {
      diameter: 10_000,
      density: 8000,
      velocity: 72,
      angle: 89,
      location: { lat: 90, lng: 180 },
      targetDensity: 8000,
    };

    // when
    const parsedInput = impactInputSchema.parse(input);

    // then
    expect(parsedInput.diameter).toBe(10_000);
    expect(parsedInput.density).toBe(8000);
    expect(parsedInput.velocity).toBe(72_000);
    expect(parsedInput.angle).toBe(89);
    expect(parsedInput.location.lat).toBe(90);
    expect(parsedInput.location.lng).toBe(180);
  });

  it('defaults target density to rock when omitted', () => {
    // given
    const inputWithoutTargetDensity = {
      diameter: validInput.diameter,
      density: validInput.density,
      velocity: validInput.velocity,
      angle: validInput.angle,
      location: validInput.location,
    };

    // when
    const parsedInput = impactInputSchema.parse(inputWithoutTargetDensity);

    // then
    expect(parsedInput.targetDensity).toBe(3000);
  });

  it('rejects invalid impact input bounds', () => {
    // given
    const invalidCases = [
      { name: 'diameter below min', input: { ...validInput, diameter: 0 } },
      { name: 'diameter above max', input: { ...validInput, diameter: 10_001 } },
      { name: 'density below min', input: { ...validInput, density: 999 } },
      { name: 'density above max', input: { ...validInput, density: 8001 } },
      { name: 'velocity below min', input: { ...validInput, velocity: 10.99 } },
      { name: 'velocity above max', input: { ...validInput, velocity: 72.01 } },
      { name: 'angle below min', input: { ...validInput, angle: 0 } },
      { name: 'angle above max', input: { ...validInput, angle: 90 } },
      { name: 'target density below min', input: { ...validInput, targetDensity: 999 } },
      { name: 'target density above max', input: { ...validInput, targetDensity: 8001 } },
      { name: 'non-finite diameter', input: { ...validInput, diameter: Number.NaN } },
    ] satisfies ReadonlyArray<{ name: string; input: unknown }>;

    // when
    const results = invalidCases.map(({ name, input }) => ({ name, result: impactInputSchema.safeParse(input) }));

    // then
    expect(results).toHaveLength(11);
    for (const { name, result } of results) {
      expect(result.success, name).toBe(false);
    }
  });

  it('returns i18n error keys when impact fields are invalid', () => {
    // given
    const invalidInput = {
      ...validInput,
      diameter: 0,
      velocity: 10,
      location: { lat: 91, lng: 0 },
    };

    // when
    const result = impactInputSchema.safeParse(invalidInput);

    // then
    if (result.success) {
      throw new Error('Expected invalid impact input');
    }
    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'validation.impact.diameter.min',
        'validation.impact.velocity.min',
        'validation.location.lat.max',
      ])
    );
  });

  it('rejects invalid location bounds', () => {
    // given
    const invalidCases = [
      { name: 'latitude below min', input: { lat: -91, lng: 0 } },
      { name: 'latitude above max', input: { lat: 91, lng: 0 } },
      { name: 'longitude below min', input: { lat: 0, lng: -181 } },
      { name: 'longitude above max', input: { lat: 0, lng: 181 } },
      { name: 'empty label', input: { lat: 0, lng: 0, label: '' } },
    ] satisfies ReadonlyArray<{ name: string; input: unknown }>;

    // when
    const results = invalidCases.map(({ name, input }) => ({ name, result: locationSchema.safeParse(input) }));

    // then
    for (const { name, result } of results) {
      expect(result.success, name).toBe(false);
    }
  });

  it('accepts a valid saved scenario', () => {
    // given
    const scenario = {
      kind: 'scenario',
      id: '8c2f8db3-0940-48f9-9c3b-09bb16a7ef54',
      name: 'Tunguska preset',
      params: validInput,
      createdAt: '2026-04-28T00:00:00.000Z',
      updatedAt: '2026-04-28T00:00:00.000Z',
    };

    // when
    const parsedScenario = scenarioSchema.parse(scenario);

    // then
    expect(parsedScenario.kind).toBe('scenario');
    expect(parsedScenario.id).toBe(scenario.id);
    expect(parsedScenario.params.velocity).toBe(19_000);
  });

  it('accepts a valid historical event scenario', () => {
    // given
    const historicalEvent = {
      kind: 'historical',
      id: 'tunguska-1908',
      nameKey: 'scenario.historical.tunguska.name',
      year: 1908,
      location: { lat: 60.886, lng: 101.894 },
      params: validInput,
      summaryKey: 'scenario.historical.tunguska.summary',
    };

    // when
    const parsedScenario = scenarioSchema.parse(historicalEvent);

    // then
    expect(parsedScenario.kind).toBe('historical');
    if (parsedScenario.kind !== 'historical') {
      throw new Error('Expected historical scenario');
    }
    expect(parsedScenario.location.lat).toBe(60.886);
    expect(parsedScenario.params.velocity).toBe(19_000);
  });

  it('rejects malformed scenarios', () => {
    // given
    const invalidScenario = {
      kind: 'scenario',
      id: 'not-a-uuid',
      name: '',
      params: { ...validInput, diameter: 0 },
      createdAt: '',
      updatedAt: '',
    };

    // when
    const result = scenarioSchema.safeParse(invalidScenario);

    // then
    expect(result.success).toBe(false);
  });

  it('returns i18n error keys when scenario fields are invalid', () => {
    // given
    const invalidScenario = {
      kind: 'scenario',
      id: 'not-a-uuid',
      name: '',
      params: validInput,
      createdAt: '',
      updatedAt: '',
    };

    // when
    const result = scenarioSchema.safeParse(invalidScenario);

    // then
    if (result.success) {
      throw new Error('Expected invalid scenario');
    }
    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'validation.scenario.id.uuid',
        'validation.scenario.name.min',
        'validation.scenario.createdAt.required',
        'validation.scenario.updatedAt.required',
      ])
    );
  });

  it('coerces valid URL state values from query strings', () => {
    // given
    const query = {
      diameter: '60',
      density: '2200',
      velocity: '27',
      angle: '30',
      lat: '51.5',
      lng: '-0.12',
    };

    // when
    const parsedState = urlStateSchema.parse(query);

    // then
    expect(parsedState.diameter).toBe(60);
    expect(parsedState.velocity).toBe(27);
    expect(parsedState.lng).toBe(-0.12);
  });

  it('rejects invalid URL state values', () => {
    // given
    const query = { diameter: '0', velocity: '10', lat: '91' };

    // when
    const result = urlStateSchema.safeParse(query);

    // then
    expect(result.success).toBe(false);
  });
});
