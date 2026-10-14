package com.punewalkin.platform.candidate;

import jakarta.persistence.*;

@Entity
@Table(name = "candidate_skills", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"candidate_id", "skill_name"})
})
public class CandidateSkill {

    @Id
    @Column(length = 36)
    private String id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    public CandidateSkill() {
    }

    public CandidateSkill(String id, CandidateProfile candidate, String skillName) {
        this.id = id;
        this.candidate = candidate;
        this.skillName = skillName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public CandidateProfile getCandidate() {
        return candidate;
    }

    public void setCandidate(CandidateProfile candidate) {
        this.candidate = candidate;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
}
