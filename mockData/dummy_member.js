//회원 더미데이터
// 회원 전체 조회용 (GET🟢 /api/members)
export const mockMembers = [
    { memberId: 1001, name: "홍길동" },
    { memberId: 1002, name: "이영희" },
    { memberId: 1003, name: "김철수" }
  ];
  
  // 회원 단건 조회용 (GET🟢 /api/members/{memberId})
  export const mockGetMemberDetailById = (memberId) => {
    const mockMembers = {
      1001: {memberId: 1001,name: "홍길동", email: "hong@example.com",
              birthDate: "1990-05-15", phone: "010-1234-5678"},
      1002: {memberId: 1002, name: "이영희", email: "lee@example.com",
              birthDate: "1992-07-01", phone: "010-1111-2222",},
    };
    return mockMembers[memberId];
  };
  
  // 회원 등록 요청용 (POST🟡 /api/members)
  export const mockMemberCreateRequest = {
    name: "홍길동",
    email: "hong@example.com",
    password: "securePassword123",
    role: "USER",
    birthDate: "1995-06-15",
    phone: "010-1234-5678"
  };
  
  // 회원 등록 응답용 (POST🟡 /api/members)
  export const mockMemberCreateResponse = {
    memberId: 1001,
    name: "홍길동",
    email: "hong@example.com",
    role: "USER",
    birthDate: "1995-06-15",
    phone: "010-1234-5678"
  };
  
  // 회원 수정 요청/응답용 (PUT🟠 /api/members/{memberId})
  export const mockMemberUpdate = {
    memberId: 1001,
    name: "홍길동",
    email: "hong@example.com",
    birthDate: "1990-05-15",
    phone: "010-134-5678"
  };