import Section from '@/components/Section'

export function NoticeSection() {
  return (
    <Section title="공지사항">
      <div className="leading-6 text-zinc-900 dark:text-zinc-100">
        <h2 className="font-bold sm:text-lg">업데이트 내용 안내</h2>
        <h4 className="pt-3 text-sm font-bold sm:text-base">
          편의성 개선 (2024-09-03)
        </h4>
        <p className="mt-1 text-sm sm:text-base">
          1. 로그인 갱신 로직 수정: 로그인 페이지에서 올바른 정보를 입력했음에도
          콘솔로 넘어가지 않는 문제 개선
        </p>
        <p className="text-sm sm:text-base">
          2. 출석체크 개선: 모바일 페이지에서 출석 체크시 참석이외에 다른 출석
          종류(부분참석, 불참)를 선택할 시 출석체크 창이 닫히는 문제 개선
        </p>
        <p className="text-sm sm:text-base">3. 하위 패키지 및 보안 업데이트</p>
      </div>
    </Section>
  )
}
