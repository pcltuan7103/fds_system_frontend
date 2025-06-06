export const routes = {
    login: "/login",
    register: "/register",
    otp_auth: "/otp-auth",
    forgot_pass: "/forgot-pass",
    new_pass: "/new-pass",
    admin_login: "/manage/login",
    about: "/about",
    contact: "/contact",
    user: {
        home: "/",
        campaign: {
            list: "/campaigns",
            detail: "/campaign/:id/detail",
        },
        supporter: {
            list: "/supporters",
            detail: "/supporter/:id/detail",
        },
        news: {
            list: "/news",
            detail: "/news/:id/detail",
        },
        post: {
            forum: "/posts",
        },
        profile: "/user/profile",
        personal: "/user/personal",
        submit_certificate: "/user/submit-certificate",
        change_pass: "/user/change-pass",
        new_pass: "/user/new-pass",
        detail_campaign: "/user/campaign/:id/detail",
        detail_certificate: "/user/certificate/:id/detail",
        detail_request_support: "/user/requestSupport/:id/detail",
        participate_request_support:
            "/user/participateRequestSupport/:id/detail",
        donate: "/user/donate",
        return: "/user/return",
        detail_campaign_request_support:
            "/user/campaignRequestSupport/:id/detail",
        detail_campaign_request_support_for_recipient:
            "/user/recipient/campaignRequestSupport/:id/detail",
    },
    admin: {
        dashboard: "/admin",
        staff: {
            list: "/admin/staff",
            add: "/admin/staff/add",
            detail: "/admin/staff/:id/detail",
        },
        campaign: {
            list: "/admin/campaign",
            detail: "/admin/campaign/:id/detail",
            staff: {
                list: "/admin/campaign/staff",
                detail: "/admin/campaign/staff/:id/detail",
            },
            donor: {
                list: "/admin/campaign/donor",
                detail: "/admin/campaign/donor/:id/detail",
            },
        },
        news: {
            list: "/admin/news",
            detail: "/admin/news/:id/detail",
        },
        post: {
            forum: "/admin/post",
            user: "/admin/post/user",
            staff: "/admin/post/staff",
        },
    },
    staff: {
        dashboard: "/staff",
        campaign: {
            staff: {
                list: "/staff/campaign/staff",
                detail: "/staff/campaign/staff/:id/detail",
                add: "/staff/campaign/staff/add",
            },
            user: {
                list: "/staff/campaign/user",
                detail: "/staff/campaign/user/:id/detail",
            },
            request_support: {
                list: "/staff/campaign/requestSupport",
                detail: "/staff/campaign/requestSupport/:id/detail",
            },
        },
        user: {
            list: "/staff/user",
            detail: "/staff/user/:id/detail",
        },
        news: {
            list: "/staff/news",
            add: "/staff/news/add",
            detail: "/staff/news/:id/detail",
            update: "/staff/news/:id/update",
        },
        post: {
            list: "/staff/post",
            detail: "/staff/post/:id/detail",
        },
        certificate: {
            donor: {
                list: "/staff/certificate/donor",
                detail: "/staff/certificate/donor/:id/detail",
            },
            recipient: {
                list: "/staff/certificate/recipient",
                detail: "/staff/certificate/recipient/:id/detail",
            },
        },
        request_support: {
            list: "/staff/requestSupport",
            detail: "/staff/requestSupport/:id/detail",
        },
        chat: "/staff/chat",
        donate: {
            list: "/staff/donate",
            detail: "/staff/donate/:id/detail",
        },
    },
};
