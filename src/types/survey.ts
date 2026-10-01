/**
 * 대학생 피곤함 설문조사 관련 타입 정의
 * 모든 주석과 필드는 한국어 주석으로 작성되었습니다.
 */

// 설문조사 폼 입력 데이터 인터페이스
export interface SurveyFormData {
  grade: string;
  major: string;
  sleepHours: string;
  coffeeCups: string;
  fatigueLevel: number;
  gpa: string;
  activity: string;
  phoneHours: string;
  commuteMinutes: string;
}

// 저장 및 내보내기용 설문조사 응답 인터페이스
export interface SurveyResponse {
  grade: string;
  major: string;
  sleepHours: number;
  coffeeCups: number;
  fatigueLevel: number;
  gpa: number | null;
  activity: string;
  phoneHours: number;
  commuteMinutes: number;
  submittedAt: string;
}

// 엑셀 및 데이터 컬럼 정의 인터페이스
export interface SurveyColumnDefinition {
  header: string;
  key: keyof SurveyResponse;
  type: 'string' | 'number';
}
