/**
 * 대학생 피곤함 설문조사 데이터 관리 및 서비스 모듈
 * 백엔드 연동을 고려하여 데이터 저장 및 내보내기 로직을 분리하였습니다.
 */

import * as XLSX from 'xlsx';
import { SurveyColumnDefinition, SurveyResponse } from '../types/survey';

/**
 * 백엔드 서버 기본 URL
 * 향후 백엔드 서버 구축 시 실제 API 엔드포인트 URL을 여기에 입력합니다.
 */
export const API_URL = '';

/**
 * 로컬 스토리지 키 정의
 */
const STORAGE_KEY = 'college_student_fatigue_responses';

/**
 * 엑셀 및 데이터 저장용 컬럼 정의
 * 표에 정의된 순서와 형식을 엄격하게 유지합니다.
 */
export const SURVEY_COLUMNS: SurveyColumnDefinition[] = [
  { header: '학년', key: 'grade', type: 'string' },
  { header: '학과', key: 'major', type: 'string' },
  { header: '수면시간(시간)', key: 'sleepHours', type: 'number' },
  { header: '하루 커피 섭취량(잔)', key: 'coffeeCups', type: 'number' },
  { header: '현재 피곤함 수치(1~10)', key: 'fatigueLevel', type: 'number' },
  { header: '학점', key: 'gpa', type: 'number' },
  { header: '알바 및 대외활동', key: 'activity', type: 'string' },
  { header: '스마트폰 사용시간(시간)', key: 'phoneHours', type: 'number' },
  { header: '통학시간(분)', key: 'commuteMinutes', type: 'number' },
  { header: '제출시각', key: 'submittedAt', type: 'string' },
];

/**
 * 현재 저장된 모든 설문 응답 목록을 가져옵니다.
 * @returns 설문 응답 배열
 */
export function getSavedResponses(): SurveyResponse[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 설문 응답을 저장합니다.
 * 현재는 브라우저의 localStorage에 영구 보관되며,
 * 추후 API_URL이 설정되면 백엔드 서버로 fetch POST 요청을 전송하도록 확장 가능합니다.
 * @param response 저장할 설문 응답 객체
 * @returns 최신 응답 목록 배열
 */
export async function saveResponse(response: SurveyResponse): Promise<SurveyResponse[]> {
  // 백엔드 연동 분기 (API_URL 설정 시 활성화)
  if (API_URL) {
    try {
      await fetch(`${API_URL}/api/survey/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });
    } catch {
      // 서버 요청 실패 시 로컬 스토리지에 안전하게 보관 유지
    }
  }

  // 로컬 스토리지에 지속 저장
  const currentList = getSavedResponses();
  const updatedList = [...currentList, response];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return updatedList;
}

/**
 * 오늘 날짜를 YYYYMMDD 형식의 문자열로 변환합니다.
 * @returns YYYYMMDD 형태 문자열
 */
function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 설문 응답 배열을 엑셀(.xlsx) 파일로 변환하여 다운로드합니다.
 * SheetJS(xlsx)를 사용하며 열 너비를 내용에 맞게 자동 조정합니다.
 * @param responses 내보낼 설문 응답 목록
 * @returns 생성된 파일명
 */
export function exportResponsesToExcel(responses: SurveyResponse[]): string {
  if (responses.length === 0) {
    throw new Error('저장할 설문 결과가 없습니다');
  }

  // 1. 헤더 행 생성
  const headers = SURVEY_COLUMNS.map((col) => col.header);

  // 2. 데이터 행 생성
  const rows = responses.map((resp) => {
    return SURVEY_COLUMNS.map((col) => {
      const val = resp[col.key];
      // 학점 미입력 시 빈 문자열 처리
      if (val === null || val === undefined) {
        return '';
      }
      return val;
    });
  });

  // 3. 2차원 배열 데이터 결합
  const sheetData = [headers, ...rows];

  // 4. 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // 5. 열 너비 자동 계산 (한글 및 영문 글자수 가중치 적용)
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = 0;
    sheetData.forEach((row) => {
      const cellValue = row[colIndex];
      const stringValue = cellValue !== null && cellValue !== undefined ? String(cellValue) : '';
      // 한글 글자는 너비 2로 계산
      let visualLength = 0;
      for (let i = 0; i < stringValue.length; i++) {
        const charCode = stringValue.charCodeAt(i);
        if (charCode > 127) {
          visualLength += 2;
        } else {
          visualLength += 1;
        }
      }
      if (visualLength > maxLength) {
        maxLength = visualLength;
      }
    });
    // 기본 여백 4 추가, 최소 너비 10 보장
    return { wch: Math.max(maxLength + 4, 10) };
  });

  worksheet['!cols'] = colWidths;

  // 6. 워크북 생성 및 시트 추가
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '설문결과');

  // 7. 파일 다운로드 실행
  const fileName = `피곤함_설문결과_${getFormattedDate()}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return fileName;
}
