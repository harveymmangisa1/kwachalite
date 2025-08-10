import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

export default function HelpPage() {
    return (
        <div className="flex-1 space-y-4">
            <PageHeader
                title="Help & Support"
                description="Find answers to your questions and get help with the app."
            />
            <div className="px-4 sm:px-6 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           If you encounter any issues or have questions, please feel free to reach out to our support team.
                        </p>
                        <div className="space-y-2">
                            <p><strong>Email:</strong> <a href="mailto:support@octet.systems" className="text-primary hover:underline">support@octet.systems</a></p>
                            <p><strong>Website:</strong> <a href="https://octet.systems" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">octet.systems</a></p>
                        </div>
                    </CardContent>
                </Card>
                <div className="text-center text-sm text-muted-foreground py-8">
                     <div className="flex justify-center items-center mb-4">
                       <Logo />
                     </div>
                    <p>Powered by Octet Systems</p>
                    <p>&copy; {new Date().getFullYear()} Octet Systems. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    )
}
