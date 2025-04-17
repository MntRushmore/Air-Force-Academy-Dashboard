"use client"

import type React from "react"

import { useState, useRef } from "react"
import { AlertCircle, CheckCircle, FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { extractGradesFromPDF, importExtractedGrades, type ExtractedGradeData } from "@/lib/pdf-parser"

// Import PDF.js
import * as pdfjs from "pdfjs-dist"

// Set the PDF.js worker source
const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry")
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export function PDFGradeUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<ExtractedGradeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      // Check if it's a PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file.")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
      setExtractedData(null)
      setImportResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]

      // Check if it's a PDF
      if (droppedFile.type !== "application/pdf") {
        setError("Please select a PDF file.")
        return
      }

      setFile(droppedFile)
      setError(null)
      setExtractedData(null)
      setImportResult(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const resetFile = () => {
    setFile(null)
    setError(null)
    setExtractedData(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processFile = async () => {
    if (!file) return

    try {
      setIsProcessing(true)
      setProcessingProgress(0)
      setError(null)

      // Load the PDF document
      const fileArrayBuffer = await file.arrayBuffer()
      const pdfDocument = await pdfjs.getDocument({ data: fileArrayBuffer }).promise

      // Extract text from all pages
      const numPages = pdfDocument.numPages
      let fullText = ""

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        fullText += pageText + "\n"

        // Update progress
        setProcessingProgress(Math.round((i / numPages) * 100))
      }

      // Process the extracted text
      const extractedData = await extractGradesFromPDF(fullText)
      setExtractedData(extractedData)

      if (!extractedData.success) {
        setError(extractedData.message)
      }
    } catch (error) {
      console.error("Error processing PDF:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred while processing the PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (!extractedData) return

    try {
      setIsProcessing(true)
      const result = await importExtractedGrades(extractedData)
      setImportResult(result)
    } catch (error) {
      console.error("Error importing grades:", error)
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred during import.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Grades from PDF</CardTitle>
        <CardDescription>Upload a PDF grade report to automatically extract and import your grades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="application/pdf"
            />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">Upload PDF Grade Report</h3>
            <p className="text-sm text-muted-foreground mb-2">Drag and drop your PDF file here, or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supports standard grade reports with semester and grading period information
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetFile} disabled={isProcessing}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing PDF...</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {extractedData && extractedData.success && (
              <div className="space-y-4">
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{extractedData.message}</AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Extracted Courses</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {extractedData.courses.map((course, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{course.code}</CardTitle>
                          <CardDescription>{course.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <h4 className="font-medium mb-1">Semester 1</h4>
                                <div className="space-y-1">
                                  {course.grades.semester1.period1 !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Period 1:</span>
                                      <span>{course.grades.semester1.period1}%</span>
                                    </div>
                                  )}
                                  {course.grades.semester1.period2 !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Period 2:</span>
                                      <span>{course.grades.semester1.period2}%</span>
                                    </div>
                                  )}
                                  {course.grades.semester1.period3 !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Period 3:</span>
                                      <span>{course.grades.semester1.period3}%</span>
                                    </div>
                                  )}
                                  {course.grades.semester1.final !== undefined && (
                                    <div className="flex justify-between font-medium">
                                      <span>Final:</span>
                                      <span>{course.grades.semester1.final}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">Semester 2</h4>
                                <div className="space-y-1">
                                  {course.grades.semester2.period1 !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Period 1:</span>
                                      <span>{course.grades.semester2.period1}%</span>
                                    </div>
                                  )}
                                  {course.grades.semester2.period2 !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Period 2:</span>
                                      <span>{course.grades.semester2.period2}%</span>
                                    </div>
                                  )}
                                  {course.grades.semester2.period3 !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Period 3:</span>
                                      <span>{course.grades.semester2.period3}%</span>
                                    </div>
                                  )}
                                  {course.grades.semester2.final !== undefined && (
                                    <div className="flex justify-between font-medium">
                                      <span>Final:</span>
                                      <span>{course.grades.semester2.final}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span className="text-muted-foreground">Credits:</span>
                              <span>{course.credits}</span>
                            </div>
                            {course.isAP && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">AP Course:</span>
                                <span>Yes</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {extractedData.summary && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                      <h3 className="text-lg font-medium mb-2">Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Calculated GPA:</span>
                            <span className="font-medium">{extractedData.summary.gpa}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Credits:</span>
                            <span>{extractedData.summary.totalCredits}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Courses Found:</span>
                            <span>{extractedData.courses.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {importResult && (
              <Alert
                className={
                  importResult.success
                    ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
                }
              >
                {importResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{importResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{importResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {file && !isProcessing && !importResult && (
          <>
            <Button variant="outline" onClick={resetFile}>
              Cancel
            </Button>
            {!extractedData ? (
              <Button onClick={processFile}>Process PDF</Button>
            ) : (
              <Button onClick={handleImport}>Import Grades</Button>
            )}
          </>
        )}
        {importResult && (
          <Button variant="outline" onClick={resetFile}>
            Upload Another PDF
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
