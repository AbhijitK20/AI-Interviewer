import { useState } from 'react'
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { FileDown, Loader2 } from 'lucide-react'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gradeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 4,
    borderBottom: 1,
    borderBottomColor: '#f3f4f6',
  },
  metricLabel: {
    fontSize: 9,
    color: '#4b5563',
    width: '40%',
  },
  metricBar: {
    width: '40%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 9,
    color: '#1f2937',
    width: '15%',
    textAlign: 'right',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    fontSize: 9,
    color: '#3b82f6',
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  questionBlock: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  questionText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 8,
    color: '#4b5563',
    marginBottom: 4,
  },
  scoreBadge: {
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  recommendationBox: {
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    borderLeft: 3,
    borderLeftColor: '#3b82f6',
  },
  recommendationText: {
    fontSize: 9,
    color: '#1e40af',
  },
})

const cleanString = (str) => {
  if (typeof str !== 'string') return String(str || '')
  let s = str.trim()
  let prev = ''
  while (s !== prev) {
    prev = s
    s = s.replace(/^[\[\]"'\\]+/, '').replace(/[\[\]"'\\]+$/, '').trim()
  }
  s = s.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  return s
}

const safeParseArr = (data) => {
  if (!data) return []

  let items = []
  if (Array.isArray(data)) {
    items = data
  } else if (typeof data === 'string') {
    let current = data.trim()
    for (let i = 0; i < 5; i++) {
      try {
        const parsed = JSON.parse(current)
        if (Array.isArray(parsed)) {
          items = parsed
          break
        }
        if (parsed && typeof parsed === 'object') {
          items = Object.values(parsed)
          break
        }
        if (typeof parsed === 'string') {
          current = parsed
          continue
        }
      } catch {
        break
      }
    }
    if (items.length === 0) {
      items = current.split(/\r?\n|","|",\s*"|,\s*/)
    }
  }

  const result = []
  const processItem = (item) => {
    if (!item) return
    if (Array.isArray(item)) {
      item.forEach(processItem)
      return
    }
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed === '[]' || trimmed === '""' || trimmed === "''" || !trimmed) return
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            parsed.forEach(processItem)
            return
          }
        } catch {}
      }
      const cleaned = cleanString(trimmed)
      if (cleaned && cleaned !== '[]' && cleaned !== '""') {
        result.push(cleaned)
      }
    } else {
      result.push(String(item))
    }
  }

  items.forEach(processItem)
  return Array.from(new Set(result))
}

const cleanRecommendations = (text) => {
  if (!text || typeof text !== 'string') return ''
  let cleaned = text
    .replace(/\[\s*\]/g, '')
    .replace(/\\"/g, '')
    .replace(/[\[\]"]/g, '')
    .replace(/,\s*,+/g, ',')
    .replace(/,\s*$/, '')
    .replace(/:\s*,+/g, ': ')
    .trim()
  if (cleaned.endsWith(':')) {
    cleaned += ' continued growth and practice'
  }
  return cleaned
}

const safeParseObjList = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'string') {
    try {
      let parsed = JSON.parse(data)
      if (typeof parsed === 'string') parsed = JSON.parse(parsed)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return []
    }
  }
  return []
}

const InterviewReportPDF = ({ report, interview, candidate }) => {
  const radarData = safeParseObjList(report?.skillRadarData)
  const categoryScores = safeParseObjList(report?.categoryScores)
  const strengths = safeParseArr(report?.strengths)
  const weaknesses = safeParseArr(report?.weaknesses)
  const questionBreakdown = safeParseObjList(report?.questionBreakdown)
  const recommendations = cleanRecommendations(report?.recommendations)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>AI Interviewer</Text>
            <Text style={styles.subtitle}>Technical Interview Assessment Report</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.subtitle}>Generated: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.subtitle}>Report ID: {report.id}</Text>
          </View>
        </View>

        {/* Candidate Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Candidate Information</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Name</Text>
            <Text style={{ fontSize: 9, color: '#1f2937' }}>{candidate?.fullName || 'N/A'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Position</Text>
            <Text style={{ fontSize: 9, color: '#1f2937' }}>{interview?.jobDescriptionTitle || 'N/A'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Company</Text>
            <Text style={{ fontSize: 9, color: '#1f2937' }}>{interview?.companyName || 'N/A'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Interview Date</Text>
            <Text style={{ fontSize: 9, color: '#1f2937' }}>
              {interview?.completedAt ? new Date(interview.completedAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Overall Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Assessment</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{report.overallScore}</Text>
            </View>
            <View>
              <Text style={styles.title}>Grade: {report.overallGrade}</Text>
              <Text style={styles.gradeText}>
                Recommendation: {report.recommendationLevel || 'Under Review'}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 9, color: '#4b5563', lineHeight: 1.5 }}>
            {report.summary}
          </Text>
        </View>

        {/* Category Scores */}
        {categoryScores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categoryScores.map((category, index) => (
              <View key={index} style={styles.metricRow}>
                <Text style={styles.metricLabel}>{category.category}</Text>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${category.score}%` }]} />
                </View>
                <Text style={styles.metricValue}>{category.score}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            {strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Areas for Improvement */}
        {weaknesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas for Improvement</Text>
            {weaknesses.map((weakness, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{weakness}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Question Breakdown */}
        {questionBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Performance</Text>
            {questionBreakdown.slice(0, 5).map((q, index) => (
              <View key={index} style={styles.questionBlock}>
                <Text style={styles.questionText}>Q{index + 1}: {q.question}</Text>
                <Text style={styles.answerText}>{q.answer?.substring(0, 150)}...</Text>
                <Text style={styles.scoreBadge}>Score: {q.score}/100</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationText}>{recommendations}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This report was generated by AI Interviewer. Scores are based on AI analysis and should be used as one component of the hiring decision.
        </Text>
      </Page>
    </Document>
  )
}

const PDFReportGenerator = ({ report, interview, candidate }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!report) {
    return (
      <button
        disabled
        className="flex items-center px-4 py-2 bg-ink-200 text-ink-400 rounded-xl cursor-not-allowed text-sm font-medium"
      >
        <FileDown className="w-4 h-4 mr-2" />
        No Report Available
      </button>
    )
  }

  const handleDownloadPDF = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const doc = <InterviewReportPDF report={report} interview={interview} candidate={candidate} />
      const asPdf = pdf(doc)
      const blob = await asPdf.toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `interview-report-${report.id || 'summary'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error('Direct PDF export error, falling back to print:', err)
      window.print()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
        isGenerating
          ? 'bg-primary-400 text-white cursor-wait opacity-80'
          : 'bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-primary-500/20'
      }`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  )
}

export default PDFReportGenerator
