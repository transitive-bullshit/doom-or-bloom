import { z } from 'zod'
import {
  modelAnswerSchema,
  questionSchema,
  operationSchema as assessmentOperationSchema,
  currentAssessmentSchema
} from '@/lib/assessment/schema'
import type { DebugTrace, Assessment, Operation } from '@/lib/assessment/schema'

const usage = z.strictObject({
  input_tokens: z.number().int().nonnegative(),
  output_tokens: z.number().int().nonnegative()
})
const response = z.strictObject({
  model: z.string(),
  answers: z.record(z.string(), modelAnswerSchema),
  usage
})
const stage = response.extend({
  name: z.string(),
  state: z.unknown(),
  questions: z.record(z.string(), questionSchema),
  elapsedMs: z.number().nonnegative(),
  inputBytes: z.number().nonnegative(),
  outputBytes: z.number().nonnegative(),
  attempts: z.number().int().min(0).max(32),
  requests: z
    .array(
      z.strictObject({
        attempt: z.number().int().min(0).max(32),
        model: z.string(),
        questionIds: z.array(z.string()).max(96),
        elapsedMs: z.number().nonnegative(),
        status: z.number().int().nullable(),
        response: response.optional()
      })
    )
    .max(32)
    .optional()
})
const traceSchema = z.strictObject({
  requestId: z.string(),
  baseRevision: z.number().int().nonnegative(),
  stages: z.array(stage).max(12),
  decisions: z.array(
    z.strictObject({ action: z.string(), detail: z.unknown() })
  ),
  elapsedMs: z.number().nonnegative()
})
const operationSchema = z.strictObject({
  trace: traceSchema,
  provider: z.enum(['live', 'fixture']),
  createdAt: z.iso.datetime(),
  operation: assessmentOperationSchema.optional(),
  assessment: currentAssessmentSchema.optional(),
  error: z.string().optional()
})
export type SavedDebugOperation = {
  trace: DebugTrace
  provider: 'live' | 'fixture'
  createdAt: string
  operation?: Operation
  assessment?: Assessment
  error?: string
}
const recordSchema = z.strictObject({
  assessmentId: z.string(),
  operations: z.array(operationSchema).max(64)
})
const databaseName = 'doom-or-bloom:debug:v1'
const storeName = 'sessions'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () =>
      request.result.createObjectStore(storeName, { keyPath: 'assessmentId' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
function readOperations(raw: unknown): SavedDebugOperation[] {
  return raw === undefined ? [] : recordSchema.parse(raw).operations
}
export async function loadDebugOperations(
  assessmentId: string
): Promise<SavedDebugOperation[]> {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction(storeName, 'readonly')
        .objectStore(storeName)
        .get(assessmentId)
      request.onsuccess = () => {
        try {
          resolve(readOperations(request.result))
        } catch (err) {
          reject(err)
        }
      }
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}
export async function saveDebugOperation(
  assessmentId: string,
  operation: SavedDebugOperation
): Promise<SavedDebugOperation[]> {
  operationSchema.parse(operation)
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.get(assessmentId)
      let operations: SavedDebugOperation[] = []
      request.onsuccess = () => {
        try {
          operations = [
            ...readOperations(request.result).filter(
              (entry) => entry.trace.requestId !== operation.trace.requestId
            ),
            operation
          ].slice(-64)
          // Evict entire oldest operations; never trim a recorded request body.
          while (
            operations.length > 1 &&
            new Blob([JSON.stringify(operations)]).size > 32_000_000
          )
            operations.shift()
          store.put({ assessmentId, operations })
        } catch (err) {
          transaction.abort()
          reject(err)
        }
      }
      transaction.oncomplete = () => resolve(operations)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () =>
        reject(
          transaction.error ||
            new Error('Debug storage transaction was aborted')
        )
    })
  } finally {
    db.close()
  }
}
