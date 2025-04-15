declare namespace Demo {
    interface User {
        id: string;
        fname: string;
        lname: string | null;
        email: string;
        mobileNumber: string;
        dob: string;
        sex: string;
        isCustomer: string;
        user_type: string;
        rlcode: number;
        cmpcode: number;
        admsite_code: number;
        status: string;
    }
    
    interface CreateUserInput {
        fname: string;
        lname?: string | null;
        email: string;
        mobileNumber: string;
        dob: string;
        sex: string;
        isCustomer?: string;
        user_type?: string;
        rlcode?: number;
        cmpcode?: number;
        admsite_code?: number;
        status?: string;
    }

    interface UpdateUserInput {
        fname?: string;
        lname?: string | null;
        email?: string;
        mobileNumber?: string;
        dob?: string;
        sex?: Gender;
        status?: CustomerStatus;
    }
}
