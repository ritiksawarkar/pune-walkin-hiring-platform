package com.punewalkin.platform.user;

public enum AccountStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED,
    ACTIVE,               // Maintained for backward compatibility with initial seeds and tests
    VERIFIED,             // Maintained for backward compatibility with initial seeds and tests
    PENDING_VERIFICATION; // Maintained for backward compatibility with initial seeds and tests

    public boolean isApproved() {
        return this == APPROVED || this == ACTIVE || this == VERIFIED;
    }

    public boolean isPending() {
        return this == PENDING || this == PENDING_VERIFICATION;
    }

    public boolean isRejected() {
        return this == REJECTED;
    }

    public boolean isSuspended() {
        return this == SUSPENDED;
    }
}
