declare namespace Demo {
    interface User {
        id: string;
        fname: string;
        lname?: string | null;
        email: string;
        mobileNumber: string;
        username?: string;
        alternateContact?: string;
        dob: string;
        sex: string;
        anniversary?: string;
        isCustomer: string;
        active: number;
        rlcode: number;
        cmpcode: number;
        admsite_code: number;
        user_type: string;
        ext: string;
    }

    interface CreateUserInput {
        fname: string;
        lname?: string | null;
        email: string;
        mobileNumber: string;
        username?: string;
        alternateContact?: string;
        dob: string;
        sex: string;
        anniversary?: string;
        isCustomer?: string;
        active?: number;
        rlcode?: number;
        cmpcode?: number;
        admsite_code?: number;
        user_type?: string;
        ext?: string;
    }

    interface UpdateUserInput {
        fname?: string;
        lname?: string | null;
        email?: string;
        mobileNumber?: string;
        username?: string;
        alternateContact?: string;
        dob?: string;
        sex?: string;
        anniversary?: string;
        isCustomer?: string;
        active?: number;
        rlcode?: number;
        cmpcode?: number;
        admsite_code?: number;
        user_type?: string;
        ext?: string;
    }

    interface MaterialMaster {
        id: number;
        name: string;
        img_url: string;
        material_type: string;
        isSaleable: string;
        wsp: number;
        mrp: number;
        vendor_id: number;
        measurements: Measurement[];
        ext: String;
    }

    interface Measurement {
        id: number;
        material_master_id: string;
        data_type: string;
        measurement_name: string;
        seq: number;
    }
}
