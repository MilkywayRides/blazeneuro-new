"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2 } from "lucide-react"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizBuilderProps {
  value: QuizQuestion[]
  onChange: (value: QuizQuestion[]) => void
}

export function QuizBuilder({ value, onChange }: QuizBuilderProps) {
  const addQuestion = () => {
    onChange([...value, { question: "", options: ["", ""], correctAnswer: 0 }])
  }

  const removeQuestion = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, val: any) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  const addOption = (qIndex: number) => {
    const updated = [...value]
    updated[qIndex].options.push("")
    onChange(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...value]
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex)
    if (updated[qIndex].correctAnswer >= updated[qIndex].options.length) {
      updated[qIndex].correctAnswer = 0
    }
    onChange(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, val: string) => {
    const updated = [...value]
    updated[qIndex].options[oIndex] = val
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {value.map((q, qIndex) => (
        <div key={qIndex} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Label>Question {qIndex + 1}</Label>
              <Input
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                placeholder="Enter question..."
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Options (select correct answer)</Label>
            <RadioGroup
              value={q.correctAnswer.toString()}
              onValueChange={(val) => updateQuestion(qIndex, "correctAnswer", parseInt(val))}
            >
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1"
                  />
                  {q.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(qIndex, oIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addOption(qIndex)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
      ))}

      <Button onClick={addQuestion} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  )
}
