"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  solution?: string
}

interface QuizProps {
  questions: QuizQuestion[]
  pageId: string
}

export function Quiz({ questions, pageId }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const handleAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }
    
    setAnswers([...answers, selectedAnswer])
    setShowResult(true)
  }

  const handleNext = () => {
    setShowResult(false)
    setSelectedAnswer(null)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
  }

  const isQuizComplete = currentQuestion === questions.length - 1 && showResult

  if (!questions || questions.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No quiz questions available</p>
        </CardContent>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardContent className="pt-6 space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{questions.length}</span>
          </div>

          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{question.question}</h3>
            
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(val) => !showResult && setSelectedAnswer(parseInt(val))}
              disabled={showResult}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === question.correctAnswer
                  const showCorrect = showResult && isCorrect
                  const showWrong = showResult && isSelected && !isCorrect

                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        showCorrect
                          ? "border-green-500 bg-green-500/10"
                          : showWrong
                          ? "border-red-500 bg-red-500/10"
                          : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer text-foreground"
                      >
                        {option}
                      </Label>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Result Message */}
          {showResult && (
            <div className="space-y-3">
              <div
                className={`p-4 rounded-lg ${
                  selectedAnswer === question.correctAnswer
                    ? "bg-green-500/10 border border-green-500"
                    : "bg-red-500/10 border border-red-500"
                }`}
              >
                <p className="font-medium text-foreground">
                  {selectedAnswer === question.correctAnswer
                    ? "✓ Correct!"
                    : `✗ Incorrect. The correct answer is: ${question.options[question.correctAnswer]}`}
                </p>
              </div>
              
              {question.solution && (
                <div className="p-4 rounded-lg bg-muted border">
                  <p className="font-semibold text-foreground mb-2">Solution:</p>
                  <div className="prose dark:prose-invert prose-sm max-w-none prose-p:text-foreground prose-headings:text-foreground prose-code:text-orange-500">
                    <ReactMarkdown>{question.solution}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          {!showResult ? (
            <Button
              onClick={handleAnswer}
              disabled={selectedAnswer === null}
              className="ml-auto"
            >
              Submit Answer
            </Button>
          ) : isQuizComplete ? (
            <div className="w-full space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h3>
                <p className="text-lg text-muted-foreground">
                  Your score: {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
                </p>
              </div>
              <Button onClick={handleRestart} className="w-full">
                Restart Quiz
              </Button>
            </div>
          ) : (
            <Button onClick={handleNext} className="ml-auto">
              Next Question
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
