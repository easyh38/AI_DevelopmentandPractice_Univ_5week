/**
 * 대학생 피곤함 수치 측정 설문조사 메인 애플리케이션 컴포넌트
 * 부드러운 애니메이션 효과를 적용하였으며, 모든 UI 텍스트와 코드 주석은 한국어로 작성되었습니다.
 * 이모지는 일절 사용하지 않습니다.
 */

import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SurveyFormData, SurveyResponse } from './types/survey';
import {
  getSavedResponses,
  saveResponse,
  exportResponsesToExcel,
} from './services/surveyService';

// 초기 입력 폼 상태 정의
const INITIAL_FORM_DATA: SurveyFormData = {
  grade: '',
  major: '',
  sleepHours: '',
  coffeeCups: '0',
  fatigueLevel: 5,
  gpa: '',
  activity: '',
  phoneHours: '',
  commuteMinutes: '',
};

export default function App() {
  // 폼 입력 데이터 상태
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA);

  // 저장된 설문 응답 목록 상태
  const [savedResponses, setSavedResponses] = useState<SurveyResponse[]>([]);

  // 성공 메시지 상태
  const [successMessage, setSuccessMessage] = useState<string>('');

  // 엑셀 저장 알림 메시지 상태
  const [excelMessage, setExcelMessage] = useState<string>('');

  // 경고/안내 모달 알림창 상태
  const [alertMessage, setAlertMessage] = useState<string>('');

  // 고유 ID 생성 (접근성 라벨 연결용)
  const gradeId = useId();
  const majorId = useId();
  const sleepHoursId = useId();
  const coffeeCupsId = useId();
  const fatigueLevelId = useId();
  const gpaId = useId();
  const activityYesId = useId();
  const activityNoId = useId();
  const phoneHoursId = useId();
  const commuteMinutesId = useId();

  // 최초 로드 시 로컬 스토리지에 저장된 응답 불러오기
  useEffect(() => {
    const list = getSavedResponses();
    setSavedResponses(list);
  }, []);

  // 피곤함 수치 구간별 코멘트 반환 함수
  const getFatigueComment = (level: number): string => {
    if (level >= 1 && level <= 3) {
      return '쌩쌩해요';
    } else if (level >= 4 && level <= 6) {
      return '보통이에요';
    } else if (level >= 7 && level <= 8) {
      return '많이 피곤해요';
    } else {
      return '휴식이 필요해요';
    }
  };

  // 피곤함 수치 구간별 강조 색상 반환 함수
  const getFatigueColor = (level: number): string => {
    if (level >= 1 && level <= 3) {
      return '#3b82f6'; // 파란색 계열
    } else if (level >= 4 && level <= 6) {
      return '#4a5adf'; // 대표 인디고 색상
    } else if (level >= 7 && level <= 8) {
      return '#ea580c'; // 주황색 계열
    } else {
      return '#dc2626'; // 빨간색 계열
    }
  };

  // 일반 입력 필드 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 피곤함 슬라이더 변경 핸들러
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      fatigueLevel: isNaN(value) ? 5 : value,
    }));
  };

  // 경고 모달 닫기
  const closeAlert = () => {
    setAlertMessage('');
  };

  // 설문 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 필수 입력 필드 검증
    if (!formData.grade || formData.grade.trim() === '') {
      setAlertMessage('학년을 선택해주세요');
      return;
    }

    if (!formData.major || formData.major.trim() === '') {
      setAlertMessage('학과를 입력해주세요');
      return;
    }

    if (formData.sleepHours === '' || formData.sleepHours === null) {
      setAlertMessage('수면시간을 입력해주세요');
      return;
    }

    if (formData.coffeeCups === '' || formData.coffeeCups === null) {
      setAlertMessage('하루 커피 섭취량을 입력해주세요');
      return;
    }

    if (!formData.activity || formData.activity.trim() === '') {
      setAlertMessage('알바 및 대외활동 유/무를 선택해주세요');
      return;
    }

    if (formData.phoneHours === '' || formData.phoneHours === null) {
      setAlertMessage('스마트폰 사용시간을 입력해주세요');
      return;
    }

    if (formData.commuteMinutes === '' || formData.commuteMinutes === null) {
      setAlertMessage('통학시간을 입력해주세요');
      return;
    }

    // 2. 숫자 범위 유효성 검증
    const sleepNum = Number(formData.sleepHours);
    if (isNaN(sleepNum) || sleepNum < 0 || sleepNum > 24) {
      setAlertMessage('올바른 시간을 입력해주세요');
      return;
    }

    const phoneNum = Number(formData.phoneHours);
    if (isNaN(phoneNum) || phoneNum < 0 || phoneNum > 24) {
      setAlertMessage('올바른 시간을 입력해주세요');
      return;
    }

    const coffeeNum = Number(formData.coffeeCups);
    if (isNaN(coffeeNum) || coffeeNum < 0 || coffeeNum > 10) {
      setAlertMessage('하루 커피 섭취량은 0~10잔 사이로 입력해주세요');
      return;
    }

    const commuteNum = Number(formData.commuteMinutes);
    if (isNaN(commuteNum) || commuteNum < 0 || commuteNum > 300) {
      setAlertMessage('통학시간은 0~300분 사이로 입력해주세요');
      return;
    }

    // 학점 선택 입력 검증
    let parsedGpa: number | null = null;
    if (formData.gpa.trim() !== '') {
      const gpaNum = Number(formData.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.5) {
        setAlertMessage('학점은 0~4.5 사이로 입력해주세요');
        return;
      }
      parsedGpa = gpaNum;
    }

    // 3. 응답 객체 생성 (숫자형은 모두 Number로 변환)
    const newResponse: SurveyResponse = {
      grade: formData.grade,
      major: formData.major.trim(),
      sleepHours: sleepNum,
      coffeeCups: coffeeNum,
      fatigueLevel: Number(formData.fatigueLevel),
      gpa: parsedGpa,
      activity: formData.activity,
      phoneHours: phoneNum,
      commuteMinutes: commuteNum,
      submittedAt: new Date().toISOString(),
    };

    // 콘솔에 응답 객체 출력
    console.log('설문 응답 제출 데이터:', newResponse);

    // 저장 실행 및 상태 갱신
    const updatedList = await saveResponse(newResponse);
    setSavedResponses(updatedList);

    // 성공 메시지 표시
    setSuccessMessage('응답이 제출되었습니다. 참여해주셔서 감사합니다!');
    setExcelMessage('');

    // 폼 초기화
    setFormData(INITIAL_FORM_DATA);

    // 화면 최상단으로 스크롤하여 알림 확인 용이하게 처리
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 폼 초기화 핸들러 ("다시 작성" 클릭 시)
  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setSuccessMessage('');
    setExcelMessage('');
  };

  // 엑셀 다운로드 핸들러
  const handleExcelExport = () => {
    if (savedResponses.length === 0) {
      setAlertMessage('저장할 설문 결과가 없습니다');
      return;
    }

    try {
      exportResponsesToExcel(savedResponses);
      setExcelMessage('엑셀 파일이 저장되었습니다');
      setSuccessMessage('');
    } catch {
      setAlertMessage('엑셀 파일 생성 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-start">
      {/* 알림 모달 창 (AnimatePresence를 통한 부드러운 팝업 애니메이션) */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full border border-gray-200"
            >
              <h3
                id="alert-dialog-title"
                className="text-base font-bold text-gray-900 mb-2"
              >
                안내
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-5">
                {alertMessage}
              </p>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={closeAlert}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#4a5adf] hover:bg-[#5d6ce6] rounded-lg transition-colors cursor-pointer"
                >
                  확인
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 중앙 메인 컨테이너 (최대 너비 520px, 카드 레이아웃, 부드러운 진입 애니메이션) */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[520px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
      >
        {/* 헤더 섹션: 부드러운 호흡/부유 효과가 적용된 CSS 로고 및 텍스트 */}
        <header className="flex flex-col items-center text-center mb-6">
          <motion.div
            animate={{
              y: [0, -4, 0],
              boxShadow: [
                '0 2px 8px rgba(74, 90, 223, 0.2)',
                '0 6px 14px rgba(74, 90, 223, 0.35)',
                '0 2px 8px rgba(74, 90, 223, 0.2)',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
            className="w-14 h-14 rounded-full bg-[#4a5adf] flex items-center justify-center text-white font-bold text-lg tracking-wider mb-4"
            aria-hidden="true"
          >
            Zzz
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            대학생의 피곤함 수치 측정
          </h1>
          <p className="text-sm text-gray-600 font-normal">
            당신의 하루는 얼마나 피곤한가요?
          </p>
        </header>

        {/* 현재 저장된 응답 건수 현황 표시 (숫자 변경 시 부드러운 스케일 애니메이션) */}
        <section
          aria-label="응답 현황"
          className="mb-6 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs md:text-sm text-gray-700"
        >
          <span className="font-medium">설문 참여 현황</span>
          <span className="font-bold text-[#4a5adf] flex items-center gap-1">
            <span>현재 저장된 응답:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={savedResponses.length}
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                className="inline-block"
              >
                {savedResponses.length}
              </motion.span>
            </AnimatePresence>
            <span>건</span>
          </span>
        </section>

        {/* 설문 제출 완료 성공 메시지 안내창 (부드러운 슬라이드다운 애니메이션) */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden mb-6"
            >
              <div
                role="status"
                className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium leading-relaxed"
              >
                {successMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 엑셀 파일 저장 완료 안내창 (부드러운 슬라이드다운 애니메이션) */}
        <AnimatePresence>
          {excelMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden mb-6"
            >
              <div
                role="status"
                className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-[#4a5adf] text-sm font-medium leading-relaxed"
              >
                {excelMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 설문조사 입력 폼 */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* 1. 학년 (드롭다운, 필수) */}
          <div>
            <label
              htmlFor={gradeId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              학년 <span className="text-red-500">*</span>
            </label>
            <select
              id={gradeId}
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              required
              className="survey-input cursor-pointer"
            >
              <option value="">학년을 선택해주세요</option>
              <option value="1학년">1학년</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
              <option value="4학년">4학년</option>
              <option value="5학년 이상">5학년 이상</option>
            </select>
          </div>

          {/* 2. 학과 (텍스트, 필수) */}
          <div>
            <label
              htmlFor={majorId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              학과 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={majorId}
              name="major"
              value={formData.major}
              onChange={handleInputChange}
              placeholder="학과를 입력하세요 (예: 컴퓨터공학과)"
              required
              className="survey-input"
            />
          </div>

          {/* 3. 수면시간 (숫자, 필수, 단위: 시간) */}
          <div>
            <label
              htmlFor={sleepHoursId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              수면시간 (하루 평균) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                id={sleepHoursId}
                name="sleepHours"
                value={formData.sleepHours}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                placeholder="0 ~ 24"
                required
                className="survey-input pr-14"
              />
              <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                시간
              </span>
            </div>
          </div>

          {/* 4. 하루 커피 섭취량 (숫자, 필수, 단위: 잔, 기본값 0) */}
          <div>
            <label
              htmlFor={coffeeCupsId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              하루 커피 섭취량 <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                id={coffeeCupsId}
                name="coffeeCups"
                value={formData.coffeeCups}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="1"
                required
                className="survey-input pr-10"
              />
              <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                잔
              </span>
            </div>
          </div>

          {/* 5. 현재 피곤함 수치 (범위 슬라이더 1~10, 기본값 5, 필수, 동적 게이지 및 애니메이션) */}
          <div className="pt-2 pb-1">
            <label
              htmlFor={fatigueLevelId}
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              현재 피곤함 수치 <span className="text-red-500">*</span>
            </label>

            {/* 수치 실시간 대형 표시 영역 (24px, 강조색, 굵게, 중앙 정렬, 수치 변경 시 스프링 애니메이션) */}
            <div className="text-center py-2">
              <div className="text-[24px] font-bold text-[#4a5adf] leading-none mb-1 flex items-center justify-center gap-1.5">
                <span>현재 피곤함 수치:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={formData.fatigueLevel}
                    initial={{ scale: 0.8, y: -4, opacity: 0.6 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, y: 4, opacity: 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 350 }}
                    style={{ color: getFatigueColor(formData.fatigueLevel) }}
                    className="inline-block"
                  >
                    {formData.fatigueLevel}
                  </motion.span>
                </AnimatePresence>
                <span>/ 10</span>
              </div>

              {/* 구간별 코멘트 부드러운 전환 */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={getFatigueComment(formData.fatigueLevel)}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold text-gray-600 mt-1"
                >
                  {getFatigueComment(formData.fatigueLevel)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 시각적 피곤함 강도 게이지 바 애니메이션 */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                animate={{
                  width: `${(formData.fatigueLevel / 10) * 100}%`,
                  backgroundColor: getFatigueColor(formData.fatigueLevel),
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>

            {/* 슬라이더 인풋 */}
            <input
              type="range"
              id={fatigueLevelId}
              name="fatigueLevel"
              min="1"
              max="10"
              step="1"
              value={formData.fatigueLevel}
              onChange={handleSliderChange}
              required
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer my-2"
            />

            {/* 슬라이더 양쪽 라벨 (1 = 전혀 피곤하지 않음, 10 = 극도로 피곤함) */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 (전혀 피곤하지 않음)</span>
              <span>10 (극도로 피곤함)</span>
            </div>
          </div>

          {/* 6. 학점 (선택 사항, 4.5 만점, 단위: 점) */}
          <div>
            <label
              htmlFor={gpaId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              학점 (4.5 만점, 선택 입력)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                id={gpaId}
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                min="0"
                max="4.5"
                step="0.01"
                placeholder="선택 사항 (예: 3.75)"
                className="survey-input pr-10"
              />
              <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                점
              </span>
            </div>
          </div>

          {/* 7. 알바 및 대외활동 유/무 (라디오 버튼, 수평 배치, 필수) */}
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-800 mb-2">
                알바 및 대외활동 유/무 <span className="text-red-500">*</span>
              </legend>
              <div className="flex items-center gap-6 py-1">
                <div className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    id={activityYesId}
                    name="activity"
                    value="있음"
                    checked={formData.activity === '있음'}
                    onChange={handleInputChange}
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={activityYesId}
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    있음
                  </label>
                </div>
                <div className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    id={activityNoId}
                    name="activity"
                    value="없음"
                    checked={formData.activity === '없음'}
                    onChange={handleInputChange}
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={activityNoId}
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    없음
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          {/* 8. 스마트폰 사용시간 (숫자, 필수, 단위: 시간) */}
          <div>
            <label
              htmlFor={phoneHoursId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              스마트폰 사용시간 (하루 평균) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                id={phoneHoursId}
                name="phoneHours"
                value={formData.phoneHours}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                placeholder="0 ~ 24"
                required
                className="survey-input pr-14"
              />
              <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                시간
              </span>
            </div>
          </div>

          {/* 9. 통학시간 (숫자, 편도 기준, 필수, 단위: 분) */}
          <div>
            <label
              htmlFor={commuteMinutesId}
              className="block text-sm font-medium text-gray-800 mb-1.5"
            >
              통학시간 (편도) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                id={commuteMinutesId}
                name="commuteMinutes"
                value={formData.commuteMinutes}
                onChange={handleInputChange}
                min="0"
                max="300"
                step="1"
                placeholder="0 ~ 300"
                required
                className="survey-input pr-10"
              />
              <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                분
              </span>
            </div>
          </div>

          {/* 버튼 영역: 제출하기, 다시 작성, 엑셀로 저장 (상호작용 탭/호버 애니메이션 적용) */}
          <div className="pt-4 space-y-2.5">
            {/* 제출 버튼: 배경 #4a5adf, 흰색 글자, 호버 시 밝아짐 */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-[#4a5adf] hover:bg-[#5d6ce6] text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
            >
              제출하기
            </motion.button>

            {/* 보조 버튼 2개: 다시 작성 / 엑셀로 저장 */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors cursor-pointer"
              >
                다시 작성
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleExcelExport}
                className="w-full py-2.5 px-3 rounded-lg border border-[#4a5adf] bg-indigo-50/50 hover:bg-indigo-50 text-[#4a5adf] font-medium text-sm transition-colors cursor-pointer"
              >
                엑셀로 저장
              </motion.button>
            </div>
          </div>
        </form>
      </motion.main>

      {/* 하단 푸터 */}
      <footer className="mt-8 text-center text-xs text-gray-400">
        대학생의 피곤함 수치 측정 설문 시스템
      </footer>
    </div>
  );
}
