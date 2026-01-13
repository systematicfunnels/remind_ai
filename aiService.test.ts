import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// 1. Define Mocks FIRST before any imports
const mockOpenAI = jest.fn();
const mockGemini = jest.fn();
const mockOpenRouter = jest.fn();

jest.unstable_mockModule('./services/openaiService', () => ({
  parseReminderIntent: mockOpenAI
}));
jest.unstable_mockModule('./services/geminiService', () => ({
  processMessageWithAI: mockGemini
}));
jest.unstable_mockModule('./services/openRouterService', () => ({
  parseWithOpenRouter: mockOpenRouter
}));

// 2. Dynamic imports after mocking
const { unifiedParseIntent } = await import('./services/aiService');

describe('unifiedParseIntent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // 1. Heuristic Branch Tests
  test('should return LIST intent for "list" command via heuristics', async () => {
    const result = await unifiedParseIntent('list');
    expect(result).toEqual({ intent: 'LIST' });
  });

  test('should return DONE intent for "done" command via heuristics', async () => {
    const result = await unifiedParseIntent('/done');
    expect(result).toEqual({ intent: 'DONE' });
  });

  // 2. OpenAI Path (Success)
  test('should return CREATE intent when OpenAI succeeds', async () => {
    (mockOpenAI as any).mockResolvedValue({
      task: 'Buy milk',
      time: '2026-01-13T10:00:00Z'
    });

    const result = await unifiedParseIntent('remind me to buy milk');
    expect(result).toEqual({
      intent: 'CREATE',
      task: 'Buy milk',
      time: '2026-01-13T10:00:00Z'
    });
    expect(mockOpenAI).toHaveBeenCalled();
  });

  // 3. OpenAI Failure -> Gemini Success Path
  test('should fallback to Gemini when OpenAI fails', async () => {
    (mockOpenAI as any).mockRejectedValue(new Error('OpenAI Error'));
    (mockGemini as any).mockResolvedValue({
      intent: 'CREATE',
      task: 'Call mom',
      delayMinutes: 30
    });

    const result = await unifiedParseIntent('remind me to call mom in 30 mins');
    expect(result.intent).toBe('CREATE');
    expect(result.task).toBe('Call mom');
    expect(mockGemini).toHaveBeenCalled();
  });

  // 4. Timeout Scenario
  test('should fallback to Gemini if OpenAI takes > 4 seconds', async () => {
    (mockOpenAI as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ task: 'Slow', time: '...' }), 5000))
    );
    (mockGemini as any).mockResolvedValue({ intent: 'LIST' });

    const promise = unifiedParseIntent('show my tasks');
    
    // Fast-forward time
    jest.advanceTimersByTime(4500);
    
    const result = await promise;
    expect(result).toEqual({ intent: 'LIST' });
    expect(mockGemini).toHaveBeenCalled();
  });

  // 5. All LLMs Fail -> Local Heuristic Path
  test('should use local heuristics when all LLMs fail', async () => {
    (mockOpenAI as any).mockRejectedValue(new Error('Fail'));
    (mockGemini as any).mockRejectedValue(new Error('Fail'));
    (mockOpenRouter as any).mockRejectedValue(new Error('Fail'));

    const result = await unifiedParseIntent('remind me to pay bills');
    expect(result.intent).toBe('CREATE');
    expect(result.task).toBe('pay bills');
  });

  // 6. Edge Case: Unknown Input
  test('should return UNKNOWN for gibberish when all fallbacks fail', async () => {
    (mockOpenAI as any).mockResolvedValue(null);
    (mockGemini as any).mockResolvedValue({ intent: 'UNKNOWN' });
    (mockOpenRouter as any).mockResolvedValue(null);

    const result = await unifiedParseIntent('asdfghjkl');
    expect(result.intent).toBe('UNKNOWN');
  });
});
